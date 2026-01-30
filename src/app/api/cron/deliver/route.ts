import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { sendMessage } from '@/lib/messaging';

/**
 * Scalable Cron Delivery System
 * Handles 10,000+ users with batching and rate limiting
 *
 * Set up a cron job to hit this endpoint every minute:
 * - Vercel Cron: vercel.json -> { "crons": [{ "path": "/api/cron/deliver", "schedule": "* * * * *" }] }
 * - External: cron-job.org or similar
 */

// Rate limiting configuration
const BATCH_SIZE = 25; // Users per batch
const BATCH_DELAY_MS = 1500; // Delay between batches (Telegram allows ~30 msg/sec)
const CONCURRENT_SENDS = 5; // Concurrent sends within a batch

// Type definitions
interface UserRecord {
    id: string;
    email: string;
    tier: number;
    timezone?: string;
    morning_enabled?: boolean;
    morning_time?: string;
    evening_enabled?: boolean;
    evening_time?: string;
    messaging_platform?: string;
    messaging_id?: string;
    partner_name?: string;
    love_language?: string;
    preferred_tone?: string;
    special_occasions_enabled?: boolean;
    anniversary_date?: string;
    partner_birthday?: string;
}

type MessageType = 'morning' | 'evening' | 'anniversary' | 'birthday';

export async function GET(request: Request) {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();

    try {
        const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

        // Authenticate as admin
        await pb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL || '',
            process.env.POCKETBASE_ADMIN_PASSWORD || ''
        );

        // Find all eligible users (Hero+ with messaging configured)
        const users = await pb.collection('users').getFullList<UserRecord>({
            filter: `tier >= 1 && messaging_id != ""`
        });

        // Filter users who need messages NOW based on their timezone
        const usersToSend: Array<{ user: UserRecord; messageType: MessageType }> = [];

        for (const user of users) {
            const messageType = shouldSendToUser(user);
            if (messageType) {
                usersToSend.push({ user, messageType });
            }
        }

        if (usersToSend.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No users to send at this time',
                totalUsers: users.length,
                eligible: 0,
                duration: `${Date.now() - startTime}ms`,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`[Cron] Processing ${usersToSend.length} users in ${Math.ceil(usersToSend.length / BATCH_SIZE)} batches`);

        // Process in batches for scalability
        const results = await processInBatches(pb, usersToSend);

        const duration = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            totalUsers: users.length,
            eligible: usersToSend.length,
            sent: results.sent,
            errors: results.errors,
            duration: `${duration}ms`,
            batches: Math.ceil(usersToSend.length / BATCH_SIZE),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Cron delivery error:', error);
        return NextResponse.json({
            error: 'Delivery failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * Determines if a user should receive a message at the current time
 */
function shouldSendToUser(user: UserRecord): MessageType | null {
    const userTimezone = user.timezone || 'UTC';

    // Get user's local time (HH:MM format)
    const userTime = new Date().toLocaleTimeString('en-US', {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Get user's local date for special occasions
    const userDate = new Date().toLocaleDateString('en-CA', {
        timeZone: userTimezone
    }); // YYYY-MM-DD

    // Check special occasions first (Legend tier only) - they take priority
    if (user.tier >= 2 && user.special_occasions_enabled) {
        const todayMonthDay = userDate.slice(5); // MM-DD
        const targetTime = user.morning_time || '09:00';

        if (user.anniversary_date && userTime === targetTime) {
            const anniversaryMonthDay = user.anniversary_date.slice(5);
            if (todayMonthDay === anniversaryMonthDay) {
                return 'anniversary';
            }
        }

        if (user.partner_birthday && userTime === targetTime) {
            const birthdayMonthDay = user.partner_birthday.slice(5);
            if (todayMonthDay === birthdayMonthDay) {
                return 'birthday';
            }
        }
    }

    // Check morning delivery
    if (user.morning_enabled && user.morning_time && userTime === user.morning_time) {
        return 'morning';
    }

    // Check evening delivery
    if (user.evening_enabled && user.evening_time && userTime === user.evening_time) {
        return 'evening';
    }

    return null;
}

/**
 * Process users in batches with rate limiting
 */
async function processInBatches(
    pb: PocketBase,
    usersToSend: Array<{ user: UserRecord; messageType: MessageType }>
): Promise<{ sent: number; errors: number }> {
    let sent = 0;
    let errors = 0;

    // Split into batches
    const batches: typeof usersToSend[] = [];
    for (let i = 0; i < usersToSend.length; i += BATCH_SIZE) {
        batches.push(usersToSend.slice(i, i + BATCH_SIZE));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`[Cron] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} users)`);

        // Process batch with limited concurrency
        const batchResults = await processWithConcurrency(pb, batch);
        sent += batchResults.sent;
        errors += batchResults.errors;

        // Delay between batches (except for last batch)
        if (batchIndex < batches.length - 1) {
            await sleep(BATCH_DELAY_MS);
        }
    }

    return { sent, errors };
}

/**
 * Process a batch with limited concurrency
 */
async function processWithConcurrency(
    pb: PocketBase,
    batch: Array<{ user: UserRecord; messageType: MessageType }>
): Promise<{ sent: number; errors: number }> {
    let sent = 0;
    let errors = 0;

    // Process in chunks of 'CONCURRENT_SENDS' at a time
    for (let i = 0; i < batch.length; i += CONCURRENT_SENDS) {
        const chunk = batch.slice(i, i + CONCURRENT_SENDS);

        const results = await Promise.allSettled(
            chunk.map(({ user, messageType }) => sendToUser(pb, user, messageType))
        );

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                sent++;
            } else {
                errors++;
            }
        }

        // Small delay between concurrent chunks
        if (i + CONCURRENT_SENDS < batch.length) {
            await sleep(100);
        }
    }

    return { sent, errors };
}

/**
 * Send a spark message to a single user
 */
async function sendToUser(
    pb: PocketBase,
    user: UserRecord,
    messageType: MessageType
): Promise<boolean> {
    try {
        const spark = await getDailySparkForUser(pb, user, messageType);
        if (!spark) {
            console.warn(`[Cron] No spark found for user ${user.id}`);
            return false;
        }

        const success = await sendMessage({
            to: user.messaging_id!,
            platform: (user.messaging_platform as 'telegram' | 'whatsapp') || 'telegram',
            body: formatSparkMessage(spark, user.partner_name, messageType)
        });

        if (success) {
            console.log(`[Cron] ✓ Sent ${messageType} to ${user.email}`);
        }

        return success;
    } catch (err) {
        console.error(`[Cron] ✗ Error sending to ${user.email}:`, err);
        return false;
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get appropriate spark message for user
 */
async function getDailySparkForUser(
    pb: PocketBase,
    user: UserRecord,
    messageType: MessageType
): Promise<{ body: string } | null> {
    const today = new Date().toISOString().split('T')[0];

    try {
        let filter = '';

        // Special occasion messages
        if (messageType === 'anniversary') {
            filter = `occasion = "anniversary"`;
        } else if (messageType === 'birthday') {
            filter = `occasion = "birthday"`;
        } else {
            // Regular sparks
            if (user.tier >= 2) {
                filter = `tier <= 2`;
                if (user.love_language) {
                    filter += ` && (love_language = "${user.love_language}" || love_language = "")`;
                }
                if (user.preferred_tone) {
                    filter += ` && (tone = "${user.preferred_tone}" || tone = "")`;
                }
            } else {
                filter = `tier <= 1`;
            }
        }

        const messages = await pb.collection('messages').getFullList({
            filter,
            sort: '-created'
        });

        if (messages.length === 0) {
            // Fallback to any message
            const fallback = await pb.collection('messages').getFullList({
                sort: '-created',
                limit: 50
            });
            if (fallback.length > 0) {
                const hash = simpleHash(user.id + today + messageType);
                return fallback[hash % fallback.length] as { body: string };
            }
            return null;
        }

        const hash = simpleHash(user.id + today + messageType);
        return messages[hash % messages.length] as { body: string };

    } catch (err) {
        console.error('Error getting spark:', err);
        return null;
    }
}

function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function formatSparkMessage(
    spark: { body: string },
    partnerName?: string,
    messageType: MessageType = 'morning'
): string {
    let message = spark.body;

    if (partnerName) {
        message = message.replace(/\{partner\}/gi, partnerName);
        message = message.replace(/\{name\}/gi, partnerName);
    }

    const headers: Record<MessageType, string> = {
        morning: '💝 Your Daily Spark',
        evening: '🌙 Your Night Spark',
        anniversary: '💕 Happy Anniversary!',
        birthday: '🎂 Birthday Wishes'
    };

    return `${headers[messageType]}\n\n${message}\n\n— Luvora`;
}

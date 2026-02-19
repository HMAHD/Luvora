import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { messagingService } from '@/lib/messaging/messaging-service';
import type { MessagingPlatform } from '@/lib/messaging/types';
import { trackEvent, serverMetrics } from '@/lib/metrics';

/**
 * Scalable Cron Delivery System
 * Handles 10,000+ users with batching and rate limiting
 *
 * Updated to use MessagingService with user-managed messaging channels.
 * Now sends to users through THEIR OWN bots (not centralized tokens).
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
    partner_name?: string;
    love_language?: string;
    preferred_tone?: string;
    special_occasions_enabled?: boolean;
    anniversary_date?: string;
    partner_birthday?: string;
}

type MessageType = 'morning' | 'evening' | 'anniversary' | 'birthday';

export async function GET(request: Request) {
    // Verify cron secret for security - fail closed if not configured
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error('[Cron] CRON_SECRET not configured - refusing to run');
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
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

        // Find all eligible users (Hero+ tier)
        const users = await pb.collection('users').getFullList<UserRecord>({
            filter: `tier >= 1`
        });

        // Filter users who need messages NOW based on their timezone
        const usersToSend: Array<{ user: UserRecord; messageType: MessageType }> = [];

        for (const user of users) {
            const messageType = shouldSendToUser(user);
            if (messageType) {
                // Check if user has any messaging channel configured
                const hasChannel = await userHasMessagingChannel(pb, user.id);
                if (hasChannel) {
                    usersToSend.push({ user, messageType });
                }
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

        // Track batch send metrics
        serverMetrics.batchSendDuration(
            duration,
            usersToSend.length,
            results.errors === 0
        );

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
 * Check if user has any enabled messaging channel
 */
async function userHasMessagingChannel(pb: PocketBase, userId: string): Promise<boolean> {
    try {
        const channels = await pb.collection('messaging_channels').getFullList({
            filter: `user="${userId}" && enabled=true`,
            $autoCancel: false
        });
        return channels.length > 0;
    } catch (error) {
        console.error(`Error checking channels for user ${userId}:`, error);
        return false;
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
 * Send a spark message to a single user through their messaging channels
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

        const message = formatSparkMessage(spark, user.partner_name, messageType);

        // Get user's enabled messaging channels
        const channels = await pb.collection('messaging_channels').getFullList({
            filter: `user="${user.id}" && enabled=true`,
            sort: '-created', // Try newest channel first
            $autoCancel: false
        });

        if (channels.length === 0) {
            console.warn(`[Cron] No enabled channels for user ${user.id}`);
            return false;
        }

        // Try each channel until one succeeds
        for (const channel of channels) {
            const platform = channel.platform as MessagingPlatform;

            try {
                await messagingService.sendMessage(user.id, {
                    platform,
                    content: message
                });

                // Track Sentry metrics
                if (platform !== 'discord') {
                    trackEvent.automationSent(platform, true);
                }

                console.log(`[Cron] ✓ Sent ${messageType} to ${user.email} via ${platform}`);
                return true;

            } catch (error) {
                console.error(`[Cron] Failed to send via ${platform} for ${user.id}:`, error);
                // Try next channel
                continue;
            }
        }

        // All channels failed
        trackEvent.automationSent('telegram', false); // Generic failure tracking
        console.error(`[Cron] ✗ All channels failed for ${user.email}`);
        return false;

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
): Promise<{ content: string } | null> {
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
                    const safeLang = String(user.love_language).replace(/["\\\n\r]/g, '');
                    filter += ` && (love_language = "${safeLang}" || love_language = "")`;
                }
                if (user.preferred_tone) {
                    const safeTone = String(user.preferred_tone).replace(/["\\\n\r]/g, '');
                    filter += ` && (tone = "${safeTone}" || tone = "")`;
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
                return fallback[hash % fallback.length] as unknown as { content: string };
            }
            return null;
        }

        const hash = simpleHash(user.id + today + messageType);
        return messages[hash % messages.length] as unknown as { content: string };

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
    spark: { content: string },
    partnerName?: string,
    messageType: MessageType = 'morning'
): string {
    let message = spark.content;

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

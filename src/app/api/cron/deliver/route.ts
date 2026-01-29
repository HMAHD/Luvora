import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { sendMessage } from '@/lib/messaging';

// Vercel Cron or manual trigger endpoint
// Set up a cron job to hit this endpoint every minute

export async function GET(request: Request) {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

        // Authenticate as admin
        await pb.admins.authWithPassword(
            process.env.POCKETBASE_ADMIN_EMAIL || '',
            process.env.POCKETBASE_ADMIN_PASSWORD || ''
        );

        // Find users who need delivery (Hero+ with messaging configured)
        const users = await pb.collection('users').getFullList({
            filter: `tier >= 1 && messaging_id != ""`
        });

        let sent = 0;
        let errors = 0;
        const results: string[] = [];

        for (const user of users) {
            try {
                // Calculate user's local time based on their timezone
                const userTimezone = user.timezone || 'UTC';
                const userTime = new Date().toLocaleTimeString('en-US', {
                    timeZone: userTimezone,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

                // Get today's date in user's timezone for special occasions
                const userDate = new Date().toLocaleDateString('en-CA', {
                    timeZone: userTimezone
                }); // YYYY-MM-DD format

                let shouldSend = false;
                let messageType: 'morning' | 'evening' | 'anniversary' | 'birthday' = 'morning';

                // Check morning delivery
                if (user.morning_enabled && user.morning_time && userTime === user.morning_time) {
                    shouldSend = true;
                    messageType = 'morning';
                }

                // Check evening delivery
                if (user.evening_enabled && user.evening_time && userTime === user.evening_time) {
                    shouldSend = true;
                    messageType = 'evening';
                }

                // Check special occasions (Legend tier only)
                if (user.tier >= 2 && user.special_occasions_enabled) {
                    const todayMonthDay = userDate.slice(5); // MM-DD

                    // Anniversary check (send at morning time or 09:00 default)
                    if (user.anniversary_date) {
                        const anniversaryMonthDay = user.anniversary_date.slice(5);
                        if (todayMonthDay === anniversaryMonthDay) {
                            const targetTime = user.morning_time || '09:00';
                            if (userTime === targetTime) {
                                shouldSend = true;
                                messageType = 'anniversary';
                            }
                        }
                    }

                    // Birthday check
                    if (user.partner_birthday) {
                        const birthdayMonthDay = user.partner_birthday.slice(5);
                        if (todayMonthDay === birthdayMonthDay) {
                            const targetTime = user.morning_time || '09:00';
                            if (userTime === targetTime) {
                                shouldSend = true;
                                messageType = 'birthday';
                            }
                        }
                    }
                }

                if (shouldSend) {
                    // Get appropriate spark message
                    const spark = await getDailySparkForUser(pb, user, messageType);

                    if (spark) {
                        const success = await sendMessage({
                            to: user.messaging_id,
                            platform: user.messaging_platform || 'telegram',
                            body: formatSparkMessage(spark, user.partner_name, messageType)
                        });

                        if (success) {
                            sent++;
                            results.push(`✓ ${user.email} (${messageType})`);
                            console.log(`Sent ${messageType} to ${user.email} via ${user.messaging_platform}`);
                        } else {
                            errors++;
                            results.push(`✗ ${user.email} - send failed`);
                            console.error(`Failed to send to ${user.email}`);
                        }
                    }
                }
            } catch (userErr) {
                console.error(`Error processing user ${user.id}:`, userErr);
                errors++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: users.length,
            sent,
            errors,
            results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Cron delivery error:', error);
        return NextResponse.json({ error: 'Delivery failed' }, { status: 500 });
    }
}

interface UserData {
    id: string;
    tier: number;
    love_language?: string;
    preferred_tone?: string;
}

async function getDailySparkForUser(
    pb: PocketBase,
    user: UserData,
    messageType: 'morning' | 'evening' | 'anniversary' | 'birthday'
) {
    const today = new Date().toISOString().split('T')[0];

    try {
        // Build filter based on message type and user preferences
        let filter = '';

        // Special occasion messages
        if (messageType === 'anniversary') {
            filter = `occasion = "anniversary"`;
        } else if (messageType === 'birthday') {
            filter = `occasion = "birthday"`;
        } else {
            // Regular sparks - filter by tier access
            if (user.tier >= 2) {
                // Legend: access to all messages
                filter = `tier <= 2`;

                // Apply love language filter if set
                if (user.love_language) {
                    filter += ` && (love_language = "${user.love_language}" || love_language = "")`;
                }

                // Apply emotional tone filter if set
                if (user.preferred_tone) {
                    filter += ` && (tone = "${user.preferred_tone}" || tone = "")`;
                }
            } else {
                // Hero: shared messages only
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
                return fallback[hash % fallback.length];
            }
            return null;
        }

        // Deterministic selection based on user ID + date + message type
        const hash = simpleHash(user.id + today + messageType);
        const index = hash % messages.length;
        return messages[index];

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
    messageType: 'morning' | 'evening' | 'anniversary' | 'birthday' = 'morning'
): string {
    let message = spark.body;

    // Replace placeholder with partner name
    if (partnerName) {
        message = message.replace(/\{partner\}/gi, partnerName);
        message = message.replace(/\{name\}/gi, partnerName);
    }

    // Different headers based on message type
    let header = '💝 Your Daily Spark';
    if (messageType === 'evening') {
        header = '🌙 Your Evening Spark';
    } else if (messageType === 'anniversary') {
        header = '💕 Happy Anniversary!';
    } else if (messageType === 'birthday') {
        header = '🎂 Birthday Wishes';
    }

    return `${header}\n\n${message}\n\n— Luvora`;
}

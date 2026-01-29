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

        // Get current time in HH:MM format
        const now = new Date();
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();

        // Find users who need delivery now
        // We need to check users whose local time matches their morning_time
        const users = await pb.collection('users').getFullList({
            filter: `tier >= 1 && messaging_id != "" && morning_time != ""`
        });

        let sent = 0;
        let errors = 0;

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

                // Compare with morning_time (format: "HH:MM")
                if (userTime === user.morning_time) {
                    // Get today's spark message for this user
                    const spark = await getDailySparkForUser(pb, user);

                    if (spark) {
                        const success = await sendMessage({
                            to: user.messaging_id,
                            platform: user.messaging_platform || 'telegram',
                            body: formatSparkMessage(spark, user.partner_name)
                        });

                        if (success) {
                            sent++;
                            console.log(`Sent to ${user.email} via ${user.messaging_platform}`);
                        } else {
                            errors++;
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
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('Cron delivery error:', error);
        return NextResponse.json({ error: 'Delivery failed' }, { status: 500 });
    }
}

async function getDailySparkForUser(pb: PocketBase, user: { id: string; tier: number }) {
    const today = new Date().toISOString().split('T')[0];

    // Try to get a message for today
    // Legend users (tier 2) get unique messages
    // Hero users (tier 1) get shared messages

    try {
        if (user.tier >= 2) {
            // Legend: unique message based on user+date hash
            const messages = await pb.collection('messages').getFullList({
                filter: `tier = 2 || tier = 0`,
                sort: '-created'
            });

            if (messages.length > 0) {
                // Use deterministic selection based on user ID + date
                const hash = simpleHash(user.id + today);
                const index = hash % messages.length;
                return messages[index];
            }
        }

        // Hero/Free: get shared daily message
        const messages = await pb.collection('messages').getFullList({
            filter: `tier <= 1`,
            sort: '-created',
            limit: 30
        });

        if (messages.length > 0) {
            // Use date-based selection for shared message
            const dayHash = simpleHash(today);
            const index = dayHash % messages.length;
            return messages[index];
        }

        return null;
    } catch {
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

function formatSparkMessage(spark: { body: string }, partnerName?: string): string {
    let message = spark.body;

    // Replace placeholder with partner name
    if (partnerName) {
        message = message.replace(/\{partner\}/gi, partnerName);
        message = message.replace(/\{name\}/gi, partnerName);
    }

    return `💝 Your Daily Spark\n\n${message}\n\n— Luvora`;
}

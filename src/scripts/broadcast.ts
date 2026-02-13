
import PocketBase from 'pocketbase';
import { getPremiumSpark } from '../lib/algo'; // Relative import for script
import { messagingService } from '../lib/messaging/messaging-service';
import type { User } from '../lib/types';

// Constants
const POLL_INTERVAL_MS = 60 * 60 * 1000; // Check every hour
const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

/**
 * The Automation Loop
 */
async function runBroadcast() {
    console.log('--- Starting Broadcast Loop ---');

    const pb = new PocketBase(PB_URL);

    // Authenticate Admin to read all users
    await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL || '',
        process.env.POCKETBASE_ADMIN_PASSWORD || ''
    );

    console.log('Admin Authenticated');

    setInterval(async () => {
        try {
            console.log(`Checking broadcast at ${new Date().toISOString()}...`);
            const today = new Date().toISOString().split('T')[0];

            // 1. Query "Legend" Users (Automation Tier)
            const legends = await pb.collection('users').getFullList({
                filter: `tier = 'legend' && messaging_id != ''`
            });

            console.log(`Found ${legends.length} Legend users.`);

            for (const record of legends) {
                const user = record as unknown as User;

                // 2. Scheduled Time Check
                if (!user.timezone || !user.morning_time) continue;

                const nowInUserTz = new Date().toLocaleTimeString('en-US', {
                    timeZone: user.timezone,
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                });
                // Compare HH:00 (since we run hourly)
                const userHour = nowInUserTz.split(':')[0]; // "08"
                const targetHour = user.morning_time.split(':')[0]; // "08" (from "08:00")

                if (userHour !== targetHour) continue; // Not their time yet

                // 3. Idempotency Check
                if (user.last_sent_date === today) {
                    console.log(`Skipping ${user.email} - Already sent today.`);
                    continue;
                }

                // 4. Generate Message
                const spark = await getPremiumSpark(new Date(), user.id || '', user.recipient_role || 'neutral');
                const messageBody = `🌅 *Daily Spark for ${user.partner_name || 'My Love'}*\n\n"${spark.morning.content}"\n\n— Sent via Luvora`;

                // 5. Send
                if (user.messaging_platform && user.messaging_id) {
                    const sent = await sendMessage({
                        to: user.messaging_id,
                        platform: user.messaging_platform,
                        body: messageBody
                    });

                    // 6. Atomic Update
                    if (sent) {
                        const newStreak = (user.streak || 0) + 1;
                        await pb.collection('users').update(user.id || '', {
                            last_sent_date: today,
                            streak: newStreak
                        });
                        console.log(`✅ Sent to ${user.email} (Streak: ${newStreak})`);
                    } else {
                        console.error(`❌ Failed to send to ${user.email}`);
                    }
                }
            }

        } catch (err) {
            console.error('Broadcast Loop Error:', err);
        }
    }, POLL_INTERVAL_MS);
}

// Start
runBroadcast().catch(console.error);

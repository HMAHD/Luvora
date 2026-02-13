/**
 * Telegram Bot Setup API
 *
 * POST /api/channels/telegram/setup
 *
 * Allows users to connect their own Telegram bot by providing the bot token.
 * Steps:
 * 1. Validate bot token with Telegram API
 * 2. Encrypt and save to PocketBase
 * 3. Start the bot channel
 *
 * Body: { botToken: string }
 * Returns: { success: boolean, botUsername?: string, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';
import { encrypt } from '@/lib/crypto';
import { messagingService } from '@/lib/messaging/messaging-service';

export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const authCookie = req.cookies.get('pb_auth');
        if (!authCookie) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Load auth from cookie
        pb.authStore.loadFromCookie(authCookie.value);

        if (!pb.authStore.isValid || !pb.authStore.model) {
            return NextResponse.json(
                { success: false, error: 'Invalid session' },
                { status: 401 }
            );
        }

        const userId = pb.authStore.model.id;

        // Parse request body
        const body = await req.json();
        const { botToken } = body;

        if (!botToken || typeof botToken !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Bot token is required' },
                { status: 400 }
            );
        }

        // Validate token with Telegram API
        let botInfo;
        try {
            const response = await fetch(
                `https://api.telegram.org/bot${botToken}/getMe`
            );

            if (!response.ok) {
                return NextResponse.json(
                    { success: false, error: 'Invalid bot token' },
                    { status: 400 }
                );
            }

            const data = await response.json();

            if (!data.ok) {
                return NextResponse.json(
                    { success: false, error: 'Bot token validation failed' },
                    { status: 400 }
                );
            }

            botInfo = data.result;

        } catch (error) {
            console.error('Telegram API error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to validate bot token' },
                { status: 500 }
            );
        }

        // Encrypt the bot token
        const encryptedToken = encrypt(botToken);

        // Save to PocketBase
        try {
            // Check if user already has a Telegram channel
            const existing = await pb.collection('messaging_channels').getFullList({
                filter: `user="${userId}" && platform="telegram"`,
                $autoCancel: false
            });

            const configData = {
                botToken: encryptedToken,
                botUsername: botInfo.username,
                botName: botInfo.first_name
            };

            if (existing.length > 0) {
                // Update existing
                await pb.collection('messaging_channels').update(existing[0].id, {
                    enabled: true,
                    config: configData,
                    updated: new Date().toISOString()
                }, {
                    $autoCancel: false
                });
            } else {
                // Create new
                await pb.collection('messaging_channels').create({
                    user: userId,
                    platform: 'telegram',
                    enabled: true,
                    config: configData
                }, {
                    $autoCancel: false
                });
            }

            // Start the channel
            await messagingService.startChannel(userId, 'telegram', configData);

            return NextResponse.json({
                success: true,
                botUsername: botInfo.username,
                botName: botInfo.first_name
            });

        } catch (error) {
            console.error('PocketBase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to save configuration' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Setup error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

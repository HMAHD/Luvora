/**
 * Discord Bot Setup API
 *
 * POST /api/channels/discord/setup
 *
 * Allows users to connect their own Discord bot by providing the bot token.
 * Steps:
 * 1. Validate bot token with Discord API
 * 2. Encrypt and save to PocketBase
 * 3. Start the bot channel
 *
 * Body: { botToken: string }
 * Returns: { success: boolean, botUsername?: string, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto';
import { messagingService } from '@/lib/messaging/messaging-service';
import { authenticateRequest } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
    try {
        // Authenticate request
        const authResult = await authenticateRequest(req);

        if (!authResult.success) {
            return NextResponse.json(
                { success: false, error: authResult.error.error },
                { status: authResult.error.status }
            );
        }

        const { pb, userId } = authResult.data;

        // Parse request body
        const body = await req.json();
        const { botToken } = body;

        if (!botToken || typeof botToken !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Bot token is required' },
                { status: 400 }
            );
        }

        // Validate token with Discord API
        let botInfo;
        try {
            const response = await fetch('https://discord.com/api/v10/users/@me', {
                headers: {
                    Authorization: `Bot ${botToken}`
                }
            });

            if (!response.ok) {
                return NextResponse.json(
                    { success: false, error: 'Invalid bot token' },
                    { status: 400 }
                );
            }

            botInfo = await response.json();

            // Verify it's a bot account
            if (!botInfo.bot) {
                return NextResponse.json(
                    { success: false, error: 'Token must be for a bot account' },
                    { status: 400 }
                );
            }

        } catch (error) {
            console.error('Discord API error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to validate bot token' },
                { status: 500 }
            );
        }

        // Encrypt the bot token
        let encryptedToken: string;
        try {
            encryptedToken = encrypt(botToken);
        } catch (error) {
            console.error('Encryption error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to encrypt bot token. Check server ENCRYPTION_KEY configuration.'
                },
                { status: 500 }
            );
        }

        // Save to PocketBase
        try {
            // Check if user already has a Discord channel
            const existing = await pb.collection('messaging_channels').getFullList({
                filter: `user="${userId}" && platform="discord"`,
                $autoCancel: false
            });

            const configData = {
                enabled: true,
                botToken: encryptedToken,
                botUsername: botInfo.username
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
                    platform: 'discord',
                    enabled: true,
                    config: configData
                }, {
                    $autoCancel: false
                });
            }

            // Start the channel - catch errors to prevent 500 response
            try {
                await messagingService.startChannel(userId, 'discord', configData);
            } catch (channelError) {
                console.error('Channel start error (non-fatal):', channelError);
                // Channel will retry via reconnection logic
            }

            return NextResponse.json({
                success: true,
                botUsername: botInfo.username,
                botId: botInfo.id
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

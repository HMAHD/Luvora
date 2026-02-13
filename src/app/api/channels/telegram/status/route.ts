/**
 * Telegram Channel Status API
 *
 * GET /api/channels/telegram/status
 *
 * Returns the current status of user's Telegram channel.
 *
 * Returns: {
 *   connected: boolean,
 *   enabled?: boolean,
 *   botUsername?: string,
 *   botName?: string,
 *   telegramUserId?: string,
 *   linked?: boolean,
 *   lastUsed?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';
import { messagingService } from '@/lib/messaging/messaging-service';

export async function GET(req: NextRequest) {
    try {
        // Get authenticated user
        const authCookie = req.cookies.get('pb_auth');
        if (!authCookie) {
            return NextResponse.json(
                { connected: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Load auth from cookie
        pb.authStore.loadFromCookie(authCookie.value);

        if (!pb.authStore.isValid || !pb.authStore.model) {
            return NextResponse.json(
                { connected: false, error: 'Invalid session' },
                { status: 401 }
            );
        }

        const userId = pb.authStore.model.id;

        // Get channel config from PocketBase
        try {
            const channels = await pb.collection('messaging_channels').getFullList({
                filter: `user="${userId}" && platform="telegram"`,
                $autoCancel: false
            });

            if (channels.length === 0) {
                return NextResponse.json({
                    connected: false
                });
            }

            const channel = channels[0];
            const config = channel.config || {};

            // Check if channel is running in MessagingService
            const isRunning = messagingService.isChannelRunning(userId, 'telegram');
            const channelInstance = messagingService.getChannel(userId, 'telegram');
            const isLinked = channelInstance?.isLinked?.() || false;

            return NextResponse.json({
                connected: true,
                enabled: channel.enabled,
                botUsername: config.botUsername,
                botName: config.botName,
                telegramUserId: config.telegramUserId,
                linked: isLinked,
                running: isRunning,
                lastUsed: channel.last_used,
                createdAt: channel.created
            });

        } catch (error) {
            console.error('PocketBase error:', error);
            return NextResponse.json(
                { connected: false, error: 'Failed to fetch status' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Status error:', error);
        return NextResponse.json(
            { connected: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

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
import { messagingService } from '@/lib/messaging/messaging-service';
import { authenticateRequest } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
    try {
        // Authenticate request
        const authResult = await authenticateRequest(req);

        if (!authResult.success) {
            return NextResponse.json(
                { connected: false, error: authResult.error.error },
                { status: authResult.error.status }
            );
        }

        const { pb, userId } = authResult.data;

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

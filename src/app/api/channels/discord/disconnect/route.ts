/**
 * Discord Disconnect API
 *
 * POST /api/channels/discord/disconnect
 *
 * Disconnects and removes the Discord configuration for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { messagingService } from '@/lib/messaging/messaging-service';

export async function POST(req: NextRequest) {
    try {
        const authResult = await authenticateRequest(req);

        if (!authResult.success) {
            return NextResponse.json(
                { success: false, error: authResult.error.error },
                { status: authResult.error.status }
            );
        }

        const { pb, userId } = authResult.data;

        // Stop the channel if running
        try {
            await messagingService.stopChannel(userId, 'discord');
        } catch (error) {
            console.error('Error stopping Discord channel:', error);
        }

        // Delete from PocketBase
        try {
            const existing = await pb.collection('messaging_channels').getFullList({
                filter: `user="${userId}" && platform="discord"`,
                $autoCancel: false
            });

            if (existing.length > 0) {
                await pb.collection('messaging_channels').delete(existing[0].id, {
                    $autoCancel: false
                });
            }

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error('PocketBase error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to disconnect' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Disconnect error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

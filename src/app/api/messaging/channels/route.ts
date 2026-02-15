import { NextRequest, NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';
import { messagingService } from '@/lib/messaging/messaging-service';
import { TIER } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Get user's connected messaging channels
 *
 * Returns:
 * - List of connected channels (telegram, whatsapp, discord)
 * - Whether each channel is running/healthy
 * - Single-channel restriction status for the user
 *
 * Used by frontend to show connected state and provide switching guidance
 */
export async function GET(request: NextRequest) {
    try {
        // Get user ID from PocketBase auth
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Extract token and validate
        const token = authHeader.replace('Bearer ', '');
        pb.authStore.save(token);

        if (!pb.authStore.isValid || !pb.authStore.model) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const userId = pb.authStore.model.id;
        const userTier = pb.authStore.model.tier as number;

        // Get user's messaging channel configurations from database
        const channelConfigs = await pb.collection('messaging_channels').getFullList({
            filter: `user="${userId}"`,
            $autoCancel: false
        });

        // Check which channels are actually running in MessagingService
        const channels = ['telegram', 'whatsapp', 'discord'].map(platform => {
            const config = channelConfigs.find(c => c.platform === platform);
            const isRunning = messagingService.isChannelRunning(userId, platform as any);
            const channel = messagingService.getChannel(userId, platform as any);

            return {
                platform,
                enabled: config?.enabled || false,
                configured: !!config,
                running: isRunning,
                healthy: channel?.running || false,
                config: config ? {
                    botUsername: config.config?.botUsername,
                    phoneNumber: config.config?.phoneNumber,
                    // Don't expose sensitive data like tokens
                } : null
            };
        });

        // Determine connected channels (running and healthy)
        const connectedChannels = channels.filter(c => c.running && c.healthy);

        // Single-channel restriction applies to Elite and Legend tiers
        const hasSingleChannelRestriction = userTier >= TIER.HERO;

        // Can add more channels?
        const canAddMore = hasSingleChannelRestriction
            ? connectedChannels.length === 0
            : true; // Free tier has no restriction (yet)

        return NextResponse.json({
            userId,
            userTier,
            hasSingleChannelRestriction,
            canAddMore,
            connectedChannels: connectedChannels.map(c => c.platform),
            channels,
            message: hasSingleChannelRestriction && connectedChannels.length > 0
                ? `You can only connect one messaging channel at a time. Disconnect ${connectedChannels[0].platform} to connect a different channel.`
                : null
        });

    } catch (error) {
        console.error('[API /api/messaging/channels] Error:', error);

        return NextResponse.json(
            {
                error: 'Failed to fetch channel status',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

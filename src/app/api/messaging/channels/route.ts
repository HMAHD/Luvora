import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { messagingService } from '@/lib/messaging/messaging-service';
import { TIER } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Get user's connected messaging channels
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

        // Create a new PocketBase instance per request to avoid auth state pollution
        const requestPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://api.luvora.love');
        const token = authHeader.replace('Bearer ', '');
        requestPb.authStore.save(token);

        if (!requestPb.authStore.isValid || !requestPb.authStore.model) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const userId = requestPb.authStore.model.id;
        const userTier = requestPb.authStore.model.tier as number;

        // Get user's messaging channel configurations from database
        const channelConfigs = await requestPb.collection('messaging_channels').getFullList({
            filter: `user="${userId}"`,
            $autoCancel: false
        });

        // Check which channels are actually running in MessagingService
        const channels = (['telegram', 'whatsapp', 'discord'] as const).map(platform => {
            const config = channelConfigs.find(c => c.platform === platform);
            const isRunning = messagingService.isChannelRunning(userId, platform);
            const channel = messagingService.getChannel(userId, platform as 'telegram' | 'whatsapp' | 'discord');

            return {
                platform,
                enabled: config?.enabled || false,
                configured: !!config,
                running: isRunning,
                healthy: channel?.isRunning() || false,
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

        const response = {
            userId,
            userTier,
            hasSingleChannelRestriction,
            canAddMore,
            connectedChannels: connectedChannels.map(c => c.platform),
            channels,
            message: hasSingleChannelRestriction && connectedChannels.length > 0
                ? `You can only connect one messaging channel at a time. Disconnect ${connectedChannels[0].platform} to connect a different channel.`
                : null
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('[API /api/messaging/channels] Error:', error);

        return NextResponse.json(
            { error: 'Failed to fetch channel status' },
            { status: 500 }
        );
    }
}

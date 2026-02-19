import { NextRequest, NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Debug endpoint to see raw channel status data
 * Access: /api/debug/channel-status?userId=YOUR_USER_ID
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId query parameter required' },
                { status: 400 }
            );
        }

        // Get user's messaging channel configurations from database
        const channelConfigs = await pb.collection('messaging_channels').getFullList({
            filter: `user="${userId}"`,
            $autoCancel: false
        });

        return NextResponse.json({
            userId,
            totalConfigs: channelConfigs.length,
            configs: channelConfigs.map(c => ({
                id: c.id,
                platform: c.platform,
                enabled: c.enabled,
                created: c.created,
                updated: c.updated,
                config: {
                    botUsername: c.config?.botUsername,
                    phoneNumber: c.config?.phoneNumber,
                    hasToken: !!c.config?.token || !!c.config?.botToken
                }
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('[DEBUG /api/debug/channel-status] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch debug data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

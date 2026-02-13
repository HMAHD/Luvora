import { NextResponse } from 'next/server';
import { messagingService } from '@/lib/messaging/messaging-service';
import { pb } from '@/lib/pocketbase';

/**
 * Test endpoint to verify user's Telegram bot is working
 * Now uses MessagingService with user-managed channels
 *
 * Usage: POST /api/test-telegram
 * Authentication: Requires valid PocketBase session cookie
 */

export async function POST(request: Request) {
    try {
        // Get authenticated user from PocketBase cookie
        const cookie = request.headers.get('cookie');
        if (!cookie) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        pb.authStore.loadFromCookie(cookie);

        if (!pb.authStore.isValid || !pb.authStore.record) {
            return NextResponse.json(
                { error: 'Invalid session' },
                { status: 401 }
            );
        }

        const userId = pb.authStore.record.id;

        const testMessage = `💝 Test Spark from Luvora

Hello! This is a test message to verify your Telegram integration is working correctly.

If you see this, your automation is set up properly! 🎉

— Luvora`;

        // Send via MessagingService
        await messagingService.sendMessage(userId, {
            platform: 'telegram',
            content: testMessage
        });

        return NextResponse.json({
            success: true,
            message: 'Test message sent successfully!'
        });

    } catch (error) {
        console.error('Test telegram error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Failed to send test message';

        return NextResponse.json({
            error: errorMessage,
            tips: [
                'Make sure you have set up a Telegram bot in Settings',
                'Ensure your bot is enabled in messaging channels',
                'Send /start to your bot on Telegram to link it',
                'Check that MessagingService is running'
            ]
        }, { status: 500 });
    }
}

// GET endpoint for quick browser test
export async function GET(request: Request) {
    try {
        // Get authenticated user from PocketBase cookie
        const cookie = request.headers.get('cookie');
        if (!cookie) {
            return NextResponse.json({
                error: 'Not authenticated',
                usage: 'POST /api/test-telegram (with valid session cookie)'
            }, { status: 401 });
        }

        pb.authStore.loadFromCookie(cookie);

        if (!pb.authStore.isValid || !pb.authStore.record) {
            return NextResponse.json({
                error: 'Invalid session',
                usage: 'POST /api/test-telegram (with valid session cookie)'
            }, { status: 401 });
        }

        const userId = pb.authStore.record.id;

        const testMessage = `💝 Test Spark from Luvora

Hello! This is a test message to verify your Telegram integration is working.

If you see this, your automation is ready! 🎉

— Luvora`;

        // Send via MessagingService
        await messagingService.sendMessage(userId, {
            platform: 'telegram',
            content: testMessage
        });

        return NextResponse.json({
            success: true,
            message: 'Test message sent to your Telegram!'
        });

    } catch (error) {
        console.error('Test telegram error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Failed to send test message';

        return NextResponse.json({
            error: errorMessage,
            tips: [
                'Make sure you have set up a Telegram bot in Settings',
                'Ensure your bot is enabled in messaging channels',
                'Send /start to your bot on Telegram to link it',
                'Check that MessagingService is running'
            ]
        }, { status: 500 });
    }
}

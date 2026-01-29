import { NextResponse } from 'next/server';
import { sendMessage } from '@/lib/messaging';

// Test endpoint to verify Telegram bot is working
// Usage: POST /api/test-telegram with { chatId: "YOUR_CHAT_ID" }

export async function POST(request: Request) {
    try {
        const { chatId } = await request.json();

        if (!chatId) {
            return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
        }

        const testMessage = `💝 Test Spark from Luvora

Hello! This is a test message to verify your Telegram integration is working correctly.

If you see this, your automation is set up properly! 🎉

— Luvora`;

        const success = await sendMessage({
            to: chatId,
            platform: 'telegram',
            body: testMessage
        });

        if (success) {
            return NextResponse.json({ success: true, message: 'Test message sent!' });
        } else {
            return NextResponse.json({ error: 'Failed to send. Check bot token and chat ID.' }, { status: 500 });
        }

    } catch (error) {
        console.error('Test telegram error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// GET endpoint for quick browser test (requires chatId as query param)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
        return NextResponse.json({
            error: 'Missing chatId parameter',
            usage: '/api/test-telegram?chatId=YOUR_TELEGRAM_CHAT_ID'
        }, { status: 400 });
    }

    const testMessage = `💝 Test Spark from Luvora

Hello! This is a test message to verify your Telegram integration is working.

If you see this, your automation is ready! 🎉

— Luvora`;

    const success = await sendMessage({
        to: chatId,
        platform: 'telegram',
        body: testMessage
    });

    if (success) {
        return NextResponse.json({ success: true, message: 'Test message sent to Telegram!' });
    } else {
        return NextResponse.json({
            error: 'Failed to send message',
            tips: [
                'Check TELEGRAM_BOT_TOKEN in .env.local',
                'Make sure user has started the bot first (/start)',
                'Verify chat ID is correct (use @userinfobot)'
            ]
        }, { status: 500 });
    }
}

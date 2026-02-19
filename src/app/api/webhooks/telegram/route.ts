import { NextRequest, NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

interface TelegramUpdate {
    update_id: number;
    message?: {
        message_id: number;
        from: {
            id: number;
            is_bot: boolean;
            first_name: string;
            username?: string;
        };
        chat: {
            id: number;
            first_name: string;
            username?: string;
            type: string;
        };
        date: number;
        text?: string;
    };
}

/**
 * Telegram Webhook Handler
 *
 * Receives updates from Telegram Bot API via webhook (production mode)
 * instead of polling (development mode).
 *
 * This is more efficient and reliable for production use.
 */
export async function POST(request: NextRequest) {
    try {
        const update: TelegramUpdate = await request.json();

        // Verify the request is from Telegram
        const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
        const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;

        if (!expectedToken) {
            console.error('TELEGRAM_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        if (secretToken !== expectedToken) {
            console.warn('Invalid Telegram webhook secret token');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Handle the update
        if (update.message?.text) {
            await handleMessage(update.message);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Telegram webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function handleMessage(message: TelegramUpdate['message']) {
    if (!message) return;

    const chatId = message.chat.id;
    const text = message.text || '';
    const userId = message.from.id;

    console.log(`Received message from ${chatId}: ${text}`);

    // Handle commands
    if (text === '/start') {
        await sendTelegramMessage(
            chatId,
            `Welcome to Luvora! 💕\n\nYour chat ID is: ${chatId}\n\nUse this ID to set up your subscription on luvora.love`
        );
        return;
    }

    if (text === '/help') {
        await sendTelegramMessage(
            chatId,
            `Luvora Bot Commands:\n\n/start - Get your chat ID\n/help - Show this help message\n/status - Check subscription status`
        );
        return;
    }

    if (text === '/status') {
        // Check subscription status
        try {
            const safeChatId = String(chatId).replace(/["\\\n\r]/g, '');
            const subscription = await pb
                .collection('subscriptions')
                .getFirstListItem(`telegram_chat_id="${safeChatId}" && status="active"`);

            if (subscription) {
                await sendTelegramMessage(
                    chatId,
                    `✅ Your subscription is active!\n\nPlan: ${subscription.tier}\nNext delivery: Check your dashboard at luvora.love`
                );
            } else {
                await sendTelegramMessage(
                    chatId,
                    `❌ No active subscription found.\n\nVisit luvora.love to get started!`
                );
            }
        } catch (error) {
            await sendTelegramMessage(
                chatId,
                `⚠️ Unable to check subscription status. Please visit luvora.love/dashboard`
            );
        }
        return;
    }

    // Default response for unknown messages
    await sendTelegramMessage(
        chatId,
        `I don't understand that command. Try /help to see available commands.`
    );
}

async function sendTelegramMessage(chatId: number, text: string) {
    try {
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text,
                    parse_mode: 'HTML',
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to send Telegram message:', error);
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
}

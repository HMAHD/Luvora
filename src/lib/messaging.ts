
/**
 * Luvora Messaging Utility
 * Handles sending messages via Telegram and WhatsApp Cloud API.
 */

interface SendMessageProps {
    to: string; // Chat ID or Phone Number
    platform: 'telegram' | 'whatsapp';
    body: string;
}

export async function sendMessage({ to, platform, body }: SendMessageProps): Promise<boolean> {
    if (platform === 'telegram') {
        return sendTelegram(to, body);
    }

    if (platform === 'whatsapp') {
        return sendWhatsApp(to, body);
    }

    return false;
}

async function sendTelegram(chatId: string, text: string): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.error('Missing TELEGRAM_BOT_TOKEN');
        return false;
    }

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        });

        const data = await res.json();
        if (!data.ok) {
            console.error('Telegram API Error:', data);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Telegram Fetch Error:', err);
        return false;
    }
}

async function sendWhatsApp(phone: string, text: string): Promise<boolean> {
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // From Meta App

    if (!token || !phoneNumberId) {
        console.error('Missing WhatsApp Check env vars');
        return false;
    }

    // NOTE: Production requires using a registered Template for business-initiated convos (Morning Spark).
    // This is a generic "text" message structure, which only works if a 24h user window is open.
    // Ideally, switch to "template" type.
    try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phone,
                type: 'text',
                text: { body: text }
            })
        });

        const data = await res.json();
        if (data.error) {
            console.error('WhatsApp API Error:', data.error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('WhatsApp Fetch Error:', err);
        return false;
    }
}

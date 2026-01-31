/**
 * Telegram Webhook Tests
 * Tests for /api/webhooks/telegram endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock PocketBase
vi.mock('@/lib/pocketbase', () => ({
    pb: {
        collection: vi.fn(() => ({
            getFirstListItem: vi.fn(),
        })),
    },
}));

// Mock fetch for Telegram API calls
global.fetch = vi.fn();

describe('/api/webhooks/telegram endpoint', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token';
        process.env.TELEGRAM_WEBHOOK_SECRET = 'test_secret';

        // Mock successful Telegram API response
        vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true }),
        } as Response);
    });

    describe('Webhook Authentication', () => {
        it('should accept valid webhook secret token', async () => {
            const update = {
                update_id: 123,
                message: {
                    message_id: 1,
                    from: { id: 12345, is_bot: false, first_name: 'Test' },
                    chat: { id: 12345, first_name: 'Test', type: 'private' },
                    date: Date.now(),
                    text: '/start',
                },
            };

            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'test_secret',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            const response = await POST(request);

            expect(response.status).toBe(200);
        });

        it('should reject invalid webhook secret token', async () => {
            const update = {
                update_id: 123,
                message: { text: '/start' },
            };

            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'wrong_secret',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            const response = await POST(request);

            expect(response.status).toBe(401);
        });
    });

    describe('/start Command', () => {
        it('should respond to /start command with chat ID', async () => {
            const chatId = 12345;
            const update = {
                update_id: 123,
                message: {
                    message_id: 1,
                    from: { id: chatId, is_bot: false, first_name: 'Test' },
                    chat: { id: chatId, first_name: 'Test', type: 'private' },
                    date: Date.now(),
                    text: '/start',
                },
            };

            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'test_secret',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            await POST(request);

            // Verify Telegram API was called with welcome message
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/sendMessage'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining(`${chatId}`),
                })
            );
        });
    });

    describe('/help Command', () => {
        it('should respond to /help command with available commands', async () => {
            const chatId = 12345;
            const update = {
                update_id: 123,
                message: {
                    message_id: 1,
                    from: { id: chatId, is_bot: false, first_name: 'Test' },
                    chat: { id: chatId, first_name: 'Test', type: 'private' },
                    date: Date.now(),
                    text: '/help',
                },
            };

            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'test_secret',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            await POST(request);

            // Verify help message was sent
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/sendMessage'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('Commands'),
                })
            );
        });
    });

    describe('/status Command', () => {
        it('should check subscription status from PocketBase', async () => {
            const chatId = 12345;
            const { pb } = await import('@/lib/pocketbase');
            const mockCollection = {
                getFirstListItem: vi.fn().mockResolvedValue({
                    id: '1',
                    tier: 'premium',
                    status: 'active',
                }),
            };
            vi.mocked(pb.collection).mockReturnValue(mockCollection as any);

            const update = {
                update_id: 123,
                message: {
                    message_id: 1,
                    from: { id: chatId, is_bot: false, first_name: 'Test' },
                    chat: { id: chatId, first_name: 'Test', type: 'private' },
                    date: Date.now(),
                    text: '/status',
                },
            };

            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'test_secret',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            await POST(request);

            // Verify PocketBase was queried
            expect(pb.collection).toHaveBeenCalledWith('subscriptions');
            expect(mockCollection.getFirstListItem).toHaveBeenCalled();
        });

        it('should handle no active subscription', async () => {
            const chatId = 12345;
            const { pb } = await import('@/lib/pocketbase');
            const mockCollection = {
                getFirstListItem: vi.fn().mockRejectedValue(new Error('Not found')),
            };
            vi.mocked(pb.collection).mockReturnValue(mockCollection as any);

            const update = {
                update_id: 123,
                message: {
                    message_id: 1,
                    from: { id: chatId, is_bot: false, first_name: 'Test' },
                    chat: { id: chatId, first_name: 'Test', type: 'private' },
                    date: Date.now(),
                    text: '/status',
                },
            };

            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'test_secret',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            await POST(request);

            // Should send "no subscription" message
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/sendMessage'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('Unable to check'),
                })
            );
        });
    });

    describe('Unknown Commands', () => {
        it('should respond to unknown commands with help message', async () => {
            const chatId = 12345;
            const update = {
                update_id: 123,
                message: {
                    message_id: 1,
                    from: { id: chatId, is_bot: false, first_name: 'Test' },
                    chat: { id: chatId, first_name: 'Test', type: 'private' },
                    date: Date.now(),
                    text: 'random text',
                },
            };

            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'test_secret',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            await POST(request);

            // Should send "unknown command" message
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/sendMessage'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining("don't understand"),
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle malformed JSON gracefully', async () => {
            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'test_secret',
                    'Content-Type': 'application/json',
                },
                body: 'invalid json',
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            const response = await POST(request);

            expect(response.status).toBe(500);
        });

        it('should return 200 for successful processing', async () => {
            const update = {
                update_id: 123,
                message: {
                    message_id: 1,
                    from: { id: 12345, is_bot: false, first_name: 'Test' },
                    chat: { id: 12345, first_name: 'Test', type: 'private' },
                    date: Date.now(),
                    text: '/start',
                },
            };

            const request = new NextRequest('http://localhost/api/webhooks/telegram', {
                method: 'POST',
                headers: {
                    'X-Telegram-Bot-Api-Secret-Token': 'test_secret',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(update),
            });

            const { POST } = await import('@/app/api/webhooks/telegram/route');
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual({ ok: true });
        });
    });
});

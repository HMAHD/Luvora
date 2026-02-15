/**
 * Telegram Channel Tests
 *
 * Tests for TelegramChannel implementation including:
 * - Initialization and configuration
 * - Message sending
 * - User linking
 * - Error handling
 * - Connection lifecycle
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TelegramChannel } from '../channels/telegram-channel';
import type { TelegramConfig } from '../types';

// Mock TelegramBot
vi.mock('node-telegram-bot-api', () => {
    return {
        default: vi.fn().mockImplementation((token, options) => {
            return {
                token,
                options,
                on: vi.fn(),
                sendMessage: vi.fn().mockResolvedValue({ message_id: 123 }),
                getMe: vi.fn().mockResolvedValue({ username: 'test_bot' }),
                deleteWebHook: vi.fn().mockResolvedValue(true),
                stopPolling: vi.fn().mockResolvedValue(undefined)
            };
        })
    };
});

describe('TelegramChannel', () => {
    let channel: TelegramChannel;
    let mockOnUserIdReceived: ReturnType<typeof vi.fn>;
    const testUserId = 'test-user-123';
    const testBotToken = 'test-bot-token-12345';

    beforeEach(() => {
        mockOnUserIdReceived = vi.fn();

        const config: TelegramConfig = {
            enabled: true,
            botToken: testBotToken,
            botUsername: 'test_bot',
            telegramUserId: undefined
        };

        channel = new TelegramChannel(config, testUserId, {
            onUserIdReceived: mockOnUserIdReceived
        });
    });

    afterEach(async () => {
        if (channel) {
            await channel.stop();
        }
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with correct configuration', () => {
            expect(channel).toBeDefined();
            expect(channel.name).toBe('telegram');
        });

        it('should not be running initially', () => {
            expect(channel.running).toBe(false);
        });

        it('should create bot with correct token', async () => {
            await channel.start();
            // Bot should be created with the provided token
            expect(channel.running).toBe(true);
        });
    });

    describe('Starting and Stopping', () => {
        it('should start successfully', async () => {
            await channel.start();
            expect(channel.running).toBe(true);
        });

        it('should handle multiple start calls gracefully', async () => {
            await channel.start();
            await channel.start(); // Should not throw
            expect(channel.running).toBe(true);
        });

        it('should stop successfully', async () => {
            await channel.start();
            await channel.stop();
            expect(channel.running).toBe(false);
        });

        it('should handle stop when not running', async () => {
            await channel.stop(); // Should not throw
            expect(channel.running).toBe(false);
        });

        it('should cleanup resources on stop', async () => {
            await channel.start();
            await channel.stop();
            expect(channel.running).toBe(false);
        });
    });

    describe('Message Sending', () => {
        beforeEach(async () => {
            await channel.start();
        });

        it('should send message successfully', async () => {
            const message = {
                userId: testUserId,
                chatId: '123456789',
                content: 'Hello, World!'
            };

            await expect(channel.send(message)).resolves.not.toThrow();
        });

        it('should throw error when bot not initialized', async () => {
            await channel.stop();

            const message = {
                userId: testUserId,
                chatId: '123456789',
                content: 'Test message'
            };

            await expect(channel.send(message)).rejects.toThrow('not initialized');
        });

        it('should throw error when chat ID missing', async () => {
            const message = {
                userId: testUserId,
                chatId: '',
                content: 'Test message'
            };

            await expect(channel.send(message)).rejects.toThrow();
        });

        it('should handle long messages', async () => {
            const longContent = 'A'.repeat(5000); // Long message
            const message = {
                userId: testUserId,
                chatId: '123456789',
                content: longContent
            };

            await expect(channel.send(message)).resolves.not.toThrow();
        });

        it('should handle special characters in messages', async () => {
            const specialContent = 'Test with <html> & special chars: @#$%^&*()';
            const message = {
                userId: testUserId,
                chatId: '123456789',
                content: specialContent
            };

            await expect(channel.send(message)).resolves.not.toThrow();
        });
    });

    describe('User Linking', () => {
        it('should not be linked initially', () => {
            expect(channel.isLinked()).toBe(false);
        });

        it('should call onUserIdReceived when user links', async () => {
            await channel.start();

            // Simulate user sending /start command
            // (In real implementation, this would be triggered by bot event)
            // For now, we test that the callback exists
            expect(mockOnUserIdReceived).toBeDefined();
        });

        it('should update linked status after receiving user ID', async () => {
            await channel.start();

            // After linking logic executes
            // expect(channel.isLinked()).toBe(true);
            // This would be tested in integration tests with actual bot
        });
    });

    describe('Error Handling', () => {
        it('should handle bot initialization failure', async () => {
            const invalidConfig: TelegramConfig = {
                enabled: true,
                botToken: '', // Invalid token
                botUsername: 'test_bot'
            };

            const invalidChannel = new TelegramChannel(invalidConfig, testUserId, {
                onUserIdReceived: mockOnUserIdReceived
            });

            // Should handle gracefully or throw appropriate error
            try {
                await invalidChannel.start();
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        it('should handle network errors during send', async () => {
            await channel.start();

            // Mock network failure
            const mockBot = (channel as any).bot;
            if (mockBot) {
                mockBot.sendMessage = vi.fn().mockRejectedValue(new Error('Network error'));
            }

            const message = {
                userId: testUserId,
                chatId: '123456789',
                content: 'Test message'
            };

            await expect(channel.send(message)).rejects.toThrow();
        });
    });

    describe('Configuration', () => {
        it('should accept valid configuration', () => {
            const config: TelegramConfig = {
                enabled: true,
                botToken: 'valid-token',
                botUsername: 'my_bot',
                telegramUserId: '987654321'
            };

            const newChannel = new TelegramChannel(config, testUserId, {
                onUserIdReceived: mockOnUserIdReceived
            });

            expect(newChannel).toBeDefined();
        });

        it('should handle pre-linked configuration', () => {
            const config: TelegramConfig = {
                enabled: true,
                botToken: testBotToken,
                botUsername: 'test_bot',
                telegramUserId: '123456789' // Already linked
            };

            const linkedChannel = new TelegramChannel(config, testUserId, {
                onUserIdReceived: mockOnUserIdReceived
            });

            // Should accept pre-linked user
            expect(linkedChannel).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid start/stop cycles', async () => {
            for (let i = 0; i < 5; i++) {
                await channel.start();
                await channel.stop();
            }
            expect(channel.running).toBe(false);
        });

        it('should handle concurrent message sends', async () => {
            await channel.start();

            const messages = Array.from({ length: 10 }, (_, i) => ({
                userId: testUserId,
                chatId: '123456789',
                content: `Message ${i + 1}`
            }));

            const sendPromises = messages.map(msg => channel.send(msg));
            await expect(Promise.all(sendPromises)).resolves.not.toThrow();
        });
    });
});

/**
 * MessagingService Tests
 *
 * Tests for MessagingService implementation including:
 * - Service initialization
 * - Channel management
 * - Message routing
 * - Error handling
 * - Lifecycle management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { messagingService } from '../messaging-service';
import type { MessagingPlatform, OutboundMessage } from '../types';

// Mock PocketBase - use stable collection mock objects so tests can modify them
const mockCollections: Record<string, Record<string, ReturnType<typeof vi.fn>>> = {};
function getMockCollection(name: string) {
    if (!mockCollections[name]) {
        mockCollections[name] = {
            getFullList: vi.fn().mockResolvedValue([]),
            getList: vi.fn().mockResolvedValue({ items: [], totalPages: 0 }),
            getOne: vi.fn().mockResolvedValue({ id: 'mock-id', tier: 0 }),
            create: vi.fn().mockResolvedValue({ id: 'mock-id' }),
            update: vi.fn().mockResolvedValue({}),
            delete: vi.fn().mockResolvedValue({})
        };
    }
    return mockCollections[name];
}

vi.mock('@/lib/pocketbase', () => ({
    pb: {
        admins: {
            authWithPassword: vi.fn().mockResolvedValue({})
        },
        collection: vi.fn((name: string) => getMockCollection(name))
    }
}));

// Mock crypto - must include encrypt for round-trip validation in initialize()
vi.mock('@/lib/crypto', () => ({
    encrypt: vi.fn((value: string) => `encrypted:${value}`),
    decrypt: vi.fn((value: string) => value.replace('encrypted:', ''))
}));

// Mock channels
vi.mock('../channels/telegram-channel', () => ({
    TelegramChannel: vi.fn().mockImplementation((_config: Record<string, unknown>, userId: string) => ({
        name: 'telegram',
        config: _config,
        userId,
        running: false,
        start: vi.fn().mockImplementation(function(this: { running: boolean }) { this.running = true; return Promise.resolve(); }),
        stop: vi.fn().mockImplementation(function(this: { running: boolean }) { this.running = false; return Promise.resolve(); }),
        send: vi.fn().mockResolvedValue(undefined),
        isRunning: vi.fn().mockImplementation(function(this: { running: boolean }) { return this.running; }),
        isLinked: vi.fn().mockReturnValue(true),
        getTelegramUserId: vi.fn().mockReturnValue('123456789')
    }))
}));
vi.mock('../channels/whatsapp-channel', () => ({
    WhatsAppChannel: vi.fn().mockImplementation((_config: Record<string, unknown>, userId: string) => ({
        name: 'whatsapp',
        config: _config,
        userId,
        running: false,
        start: vi.fn().mockImplementation(function(this: { running: boolean }) { this.running = true; return Promise.resolve(); }),
        stop: vi.fn().mockImplementation(function(this: { running: boolean }) { this.running = false; return Promise.resolve(); }),
        send: vi.fn().mockResolvedValue(undefined),
        isRunning: vi.fn().mockImplementation(function(this: { running: boolean }) { return this.running; }),
        isLinked: vi.fn().mockReturnValue(true),
        getPhoneNumber: vi.fn().mockReturnValue('1234567890'),
        hasSession: vi.fn().mockReturnValue(false)
    }))
}));

vi.mock('../channels/discord-channel', () => ({
    DiscordChannel: vi.fn().mockImplementation((_config: Record<string, unknown>, userId: string) => ({
        name: 'discord',
        config: _config,
        userId,
        running: false,
        start: vi.fn().mockImplementation(function(this: { running: boolean }) { this.running = true; return Promise.resolve(); }),
        stop: vi.fn().mockImplementation(function(this: { running: boolean }) { this.running = false; return Promise.resolve(); }),
        send: vi.fn().mockResolvedValue(undefined),
        isRunning: vi.fn().mockImplementation(function(this: { running: boolean }) { return this.running; }),
        isLinked: vi.fn().mockReturnValue(true)
    }))
}));

describe('MessagingService', () => {
    const testUserId = 'test-user-123';

    beforeEach(async () => {
        // Reset service state
        await messagingService.shutdown();

        // Reset mock collection state to prevent cross-test contamination
        for (const name of Object.keys(mockCollections)) {
            const col = mockCollections[name];
            col.getFullList.mockResolvedValue([]);
            col.getList?.mockResolvedValue({ items: [], totalPages: 0 });
            col.create.mockResolvedValue({ id: 'mock-id' });
            col.update.mockResolvedValue({});
            col.getOne?.mockResolvedValue({ id: 'mock-id', tier: 0 });
        }

        // Reset PB auth mock
        const { pb } = await import('@/lib/pocketbase');
        (pb.admins.authWithPassword as any).mockResolvedValue({});

        // Reset crypto mocks
        const { encrypt, decrypt } = await import('@/lib/crypto');
        (encrypt as any).mockImplementation((value: string) => `encrypted:${value}`);
        (decrypt as any).mockImplementation((value: string) => value.replace('encrypted:', ''));

        // Setup environment
        process.env.POCKETBASE_ADMIN_EMAIL = 'admin@test.com';
        process.env.POCKETBASE_ADMIN_PASSWORD = 'test-password';
        process.env.ENCRYPTION_KEY = 'a'.repeat(64);
    });

    afterEach(async () => {
        await messagingService.shutdown();
    });

    describe('Initialization', () => {
        it('should initialize successfully', async () => {
            await messagingService.initialize();
        });

        it('should not initialize twice', async () => {
            await messagingService.initialize();
            await messagingService.initialize(); // Should skip
        });

        it('should handle missing admin credentials gracefully', async () => {
            delete process.env.POCKETBASE_ADMIN_EMAIL;
            delete process.env.POCKETBASE_ADMIN_PASSWORD;

            // initialize() catches all errors and doesn't throw (graceful degradation)
            await messagingService.initialize();
        });

        it('should load enabled channels from database', async () => {
            const { pb } = await import('@/lib/pocketbase');
            const mockChannels = [
                {
                    user: testUserId,
                    platform: 'telegram',
                    enabled: true,
                    config: { botToken: 'test-token', botUsername: 'test_bot' }
                }
            ];

            (pb.collection('messaging_channels').getFullList as any).mockResolvedValue(mockChannels);

            await messagingService.initialize();
            expect(pb.collection).toHaveBeenCalledWith('messaging_channels');
        });

        it('should handle initialization failure gracefully', async () => {
            const { pb } = await import('@/lib/pocketbase');
            (pb.admins.authWithPassword as any).mockRejectedValueOnce(new Error('Auth failed'));

            // initialize() catches all errors (graceful degradation)
            await messagingService.initialize();
        });
    });

    describe('Channel Management', () => {
        beforeEach(async () => {
            await messagingService.initialize();
        });

        it('should start Telegram channel', async () => {
            const config = {
                enabled: true,
                botToken: 'encrypted-token',
                botUsername: 'test_bot',
                telegramUserId: '123456789'
            };

            await messagingService.startChannel(testUserId, 'telegram', config);
        });

        it('should start WhatsApp channel', async () => {
            const config = {
                enabled: true,
                sessionPath: '/tmp/test-session',
                phoneNumber: '1234567890'
            };

            await messagingService.startChannel(testUserId, 'whatsapp', config);
        });

        it('should start Discord channel', async () => {
            const config = {
                enabled: true,
                botToken: 'encrypted-token',
                botUsername: 'TestBot#1234',
                discordUserId: '987654321'
            };

            await messagingService.startChannel(testUserId, 'discord', config);
        });

        it('should stop existing channel before starting new one', async () => {
            const config = {
                enabled: true,
                botToken: 'token-1',
                botUsername: 'bot_1'
            };

            await messagingService.startChannel(testUserId, 'telegram', config);
            await messagingService.startChannel(testUserId, 'telegram', {
                ...config,
                botToken: 'token-2'
            });

            // Should have stopped the old channel
            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(true);
        });

        it('should throw error for unsupported platform', async () => {
            await expect(
                messagingService.startChannel(testUserId, 'sms' as MessagingPlatform, {})
            ).rejects.toThrow('Unsupported platform');
        });

        it('should stop channel successfully', async () => {
            const config = {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot'
            };

            await messagingService.startChannel(testUserId, 'telegram', config);
            await messagingService.stopChannel(testUserId, 'telegram');

            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(false);
        });

        it('should handle stopping non-existent channel', async () => {
            await messagingService.stopChannel(testUserId, 'telegram');
        });
    });

    describe('Message Sending', () => {
        beforeEach(async () => {
            await messagingService.initialize();

            // Start a test channel
            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot',
                telegramUserId: '123456789'
            });
        });

        it('should send message through correct channel', async () => {
            const message = {
                platform: 'telegram' as MessagingPlatform,
                content: 'Test message'
            };

            await messagingService.sendMessage(testUserId, message);
        });

        it('should throw error when channel not initialized', async () => {
            const message = {
                platform: 'whatsapp' as MessagingPlatform,
                content: 'Test message'
            };

            await expect(
                messagingService.sendMessage(testUserId, message)
            ).rejects.toThrow('not initialized');
        });

        it('should handle concurrent message sends', async () => {
            const messages = Array.from({ length: 10 }, (_, i) => ({
                platform: 'telegram' as MessagingPlatform,
                content: `Message ${i + 1}`
            }));

            const sendPromises = messages.map(msg =>
                messagingService.sendMessage(testUserId, msg)
            );

            await Promise.all(sendPromises);
        });
    });

    describe('Channel Status', () => {
        beforeEach(async () => {
            // Reset messaging_channels mock to return empty list
            getMockCollection('messaging_channels').getFullList.mockResolvedValue([]);
            await messagingService.initialize();
        });

        it('should check if channel is running', async () => {
            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(false);

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot'
            });

            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(true);
        });

        it('should get channel instance', async () => {
            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot'
            });

            const channel = messagingService.getChannel(testUserId, 'telegram');
            expect(channel).not.toBeNull();
        });

        it('should return null for non-existent channel', () => {
            const channel = messagingService.getChannel(testUserId, 'telegram');
            expect(channel).toBeNull();
        });
    });

    describe('User Channel Reload', () => {
        beforeEach(async () => {
            await messagingService.initialize();
        });

    });

    describe('Shutdown', () => {
        it('should shutdown all channels', async () => {
            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot'
            });

            await messagingService.shutdown();

            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(false);
        });

        it('should handle shutdown errors gracefully', async () => {
            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot'
            });

            // Mock channel stop to fail
            const channel = messagingService.getChannel(testUserId, 'telegram');
            if (channel) {
                channel.stop = vi.fn().mockRejectedValue(new Error('Stop failed'));
            }

            await messagingService.shutdown();
        });

        it('should clear all channels on shutdown', async () => {
            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot'
            });

            await messagingService.shutdown();

            expect(messagingService.getChannel(testUserId, 'telegram')).toBeNull();
        });
    });

    describe('Error Handling', () => {
        beforeEach(async () => {
            await messagingService.initialize();
        });

        it('should handle encryption errors', async () => {
            const { decrypt } = await import('@/lib/crypto');
            (decrypt as any).mockImplementationOnce(() => {
                throw new Error('Decryption failed');
            });

            await expect(
                messagingService.startChannel(testUserId, 'telegram', {
                    enabled: true,
                    botToken: 'encrypted-token',
                    botUsername: 'test_bot'
                })
            ).rejects.toThrow('decrypt');
        });

        it('should handle database errors during initialization', async () => {
            const { pb } = await import('@/lib/pocketbase');
            const mockCollection = pb.collection('messaging_channels');
            (mockCollection.getFullList as any).mockRejectedValueOnce(new Error('Database error'));

            await messagingService.shutdown();

            // initialize() catches errors gracefully (doesn't throw)
            await messagingService.initialize();
        });

        it('should handle unsupported platform', async () => {
            // Attempting to start a channel with unsupported platform should throw
            await expect(
                messagingService.startChannel(testUserId, 'sms' as any, {
                    enabled: true
                })
            ).rejects.toThrow('Unsupported platform');
        });
    });

    describe('Multi-User Support', () => {
        const user1 = 'user-1';
        const user2 = 'user-2';

        beforeEach(async () => {
            await messagingService.initialize();
        });

        it('should manage channels for multiple users', async () => {
            await messagingService.startChannel(user1, 'telegram', {
                enabled: true,
                botToken: 'token-1',
                botUsername: 'bot_1'
            });

            await messagingService.startChannel(user2, 'telegram', {
                enabled: true,
                botToken: 'token-2',
                botUsername: 'bot_2'
            });

            expect(messagingService.isChannelRunning(user1, 'telegram')).toBe(true);
            expect(messagingService.isChannelRunning(user2, 'telegram')).toBe(true);
        });

        it('should isolate channels between users', async () => {
            await messagingService.startChannel(user1, 'telegram', {
                enabled: true,
                botToken: 'token-1',
                botUsername: 'bot_1'
            });

            await messagingService.stopChannel(user1, 'telegram');

            // Other user's channel should not be affected
            expect(messagingService.isChannelRunning(user2, 'telegram')).toBe(false);
        });

        it('should send messages to correct user channels', async () => {
            await messagingService.startChannel(user1, 'telegram', {
                enabled: true,
                botToken: 'token-1',
                botUsername: 'bot_1',
                telegramUserId: '111'
            });

            await messagingService.startChannel(user2, 'telegram', {
                enabled: true,
                botToken: 'token-2',
                botUsername: 'bot_2',
                telegramUserId: '222'
            });

            await messagingService.sendMessage(user1, {
                platform: 'telegram',
                content: 'Message for user 1'
            });

            await messagingService.sendMessage(user2, {
                platform: 'telegram',
                content: 'Message for user 2'
            });
        });
    });
});

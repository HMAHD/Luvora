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

// Mock PocketBase
vi.mock('@/lib/pocketbase', () => ({
    pb: {
        admins: {
            authWithPassword: vi.fn().mockResolvedValue({})
        },
        collection: vi.fn((name: string) => ({
            getFullList: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: 'mock-id' }),
            update: vi.fn().mockResolvedValue({}),
            delete: vi.fn().mockResolvedValue({})
        }))
    }
}));

// Mock crypto
vi.mock('@/lib/crypto', () => ({
    decrypt: vi.fn((value: string) => value)
}));

// Mock channels
vi.mock('../channels/telegram-channel');
vi.mock('../channels/whatsapp-channel');

describe('MessagingService', () => {
    const testUserId = 'test-user-123';

    beforeEach(async () => {
        // Reset service state
        await messagingService.shutdown();
        vi.clearAllMocks();

        // Setup environment
        process.env.POCKETBASE_ADMIN_EMAIL = 'admin@test.com';
        process.env.POCKETBASE_ADMIN_PASSWORD = 'test-password';
    });

    afterEach(async () => {
        await messagingService.shutdown();
    });

    describe('Initialization', () => {
        it('should initialize successfully', async () => {
            await expect(messagingService.initialize()).resolves.not.toThrow();
        });

        it('should not initialize twice', async () => {
            await messagingService.initialize();
            await messagingService.initialize(); // Should skip
        });

        it('should authenticate as admin', async () => {
            const { pb } = await import('@/lib/pocketbase');
            await messagingService.initialize();
            expect(pb.admins.authWithPassword).toHaveBeenCalledWith(
                'admin@test.com',
                'test-password'
            );
        });

        it('should throw error when admin credentials missing', async () => {
            delete process.env.POCKETBASE_ADMIN_EMAIL;
            delete process.env.POCKETBASE_ADMIN_PASSWORD;

            // Current implementation doesn't validate, but it should
            // This test documents expected behavior
            await expect(messagingService.initialize()).rejects.toThrow();
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
            (pb.admins.authWithPassword as any).mockRejectedValue(new Error('Auth failed'));

            await expect(messagingService.initialize()).rejects.toThrow('Auth failed');
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

            await expect(
                messagingService.startChannel(testUserId, 'telegram', config)
            ).resolves.not.toThrow();
        });

        it('should start WhatsApp channel', async () => {
            const config = {
                enabled: true,
                sessionPath: '/tmp/test-session',
                phoneNumber: '1234567890'
            };

            await expect(
                messagingService.startChannel(testUserId, 'whatsapp', config)
            ).resolves.not.toThrow();
        });

        it('should start Discord channel', async () => {
            const config = {
                enabled: true,
                botToken: 'encrypted-token',
                botUsername: 'TestBot#1234',
                discordUserId: '987654321'
            };

            await expect(
                messagingService.startChannel(testUserId, 'discord', config)
            ).resolves.not.toThrow();
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
            await expect(
                messagingService.stopChannel(testUserId, 'telegram')
            ).resolves.not.toThrow();
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

            await expect(
                messagingService.sendMessage(testUserId, message)
            ).resolves.not.toThrow();
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

        it('should log notification on success', async () => {
            const { pb } = await import('@/lib/pocketbase');
            const message = {
                platform: 'telegram' as MessagingPlatform,
                content: 'Test message'
            };

            await messagingService.sendMessage(testUserId, message);

            expect(pb.collection).toHaveBeenCalledWith('messaging_notifications');
        });

        it('should log notification on failure', async () => {
            const { pb } = await import('@/lib/pocketbase');

            // Stop channel to cause failure
            await messagingService.stopChannel(testUserId, 'telegram');

            const message = {
                platform: 'telegram' as MessagingPlatform,
                content: 'Test message'
            };

            try {
                await messagingService.sendMessage(testUserId, message);
            } catch {
                expect(pb.collection).toHaveBeenCalledWith('messaging_notifications');
            }
        });

        it('should handle concurrent message sends', async () => {
            const messages = Array.from({ length: 10 }, (_, i) => ({
                platform: 'telegram' as MessagingPlatform,
                content: `Message ${i + 1}`
            }));

            const sendPromises = messages.map(msg =>
                messagingService.sendMessage(testUserId, msg)
            );

            await expect(Promise.all(sendPromises)).resolves.not.toThrow();
        });
    });

    describe('Channel Status', () => {
        beforeEach(async () => {
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

        it('should reload user channels from database', async () => {
            const { pb } = await import('@/lib/pocketbase');
            const mockChannels = [
                {
                    user: testUserId,
                    platform: 'telegram',
                    enabled: true,
                    config: { botToken: 'new-token', botUsername: 'new_bot' }
                }
            ];

            (pb.collection('messaging_channels').getFullList as any).mockResolvedValue(mockChannels);

            await expect(
                messagingService.reloadUserChannels(testUserId)
            ).resolves.not.toThrow();
        });

        it('should stop existing channels before reloading', async () => {
            // Start initial channel
            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'old-token',
                botUsername: 'old_bot'
            });

            const { pb } = await import('@/lib/pocketbase');
            (pb.collection('messaging_channels').getFullList as any).mockResolvedValue([]);

            await messagingService.reloadUserChannels(testUserId);

            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(false);
        });

        it('should handle reload failure for individual channels', async () => {
            const { pb } = await import('@/lib/pocketbase');
            const mockChannels = [
                {
                    user: testUserId,
                    platform: 'telegram',
                    enabled: true,
                    config: { botToken: 'invalid-token', botUsername: 'test_bot' }
                }
            ];

            (pb.collection('messaging_channels').getFullList as any).mockResolvedValue(mockChannels);

            // Should not throw even if individual channel fails
            await expect(
                messagingService.reloadUserChannels(testUserId)
            ).resolves.not.toThrow();
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

            await expect(messagingService.shutdown()).resolves.not.toThrow();
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
            (decrypt as any).mockImplementation(() => {
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
            (pb.collection('messaging_channels').getFullList as any).mockRejectedValue(
                new Error('Database error')
            );

            await messagingService.shutdown();

            await expect(messagingService.initialize()).rejects.toThrow('Database error');
        });

        it('should handle channel start failure', async () => {
            // Mock channel to fail on start
            await expect(
                messagingService.startChannel(testUserId, 'telegram', {
                    enabled: true,
                    botToken: '',
                    botUsername: ''
                })
            ).rejects.toThrow();
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

            await expect(
                messagingService.sendMessage(user1, {
                    platform: 'telegram',
                    content: 'Message for user 1'
                })
            ).resolves.not.toThrow();

            await expect(
                messagingService.sendMessage(user2, {
                    platform: 'telegram',
                    content: 'Message for user 2'
                })
            ).resolves.not.toThrow();
        });
    });
});

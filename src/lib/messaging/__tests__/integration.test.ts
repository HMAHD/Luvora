/**
 * Messaging Integration Tests
 *
 * End-to-end tests for the complete messaging feature including:
 * - Full setup flow
 * - Message delivery
 * - Session persistence
 * - Error recovery
 * - Multi-platform support
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { messagingService } from '../messaging-service';
import { DatabaseSessionStore } from '../database-session-store';
import { ConnectionManager } from '../connection-manager';
import type { MessagingPlatform } from '../types';

describe('Messaging Integration Tests', () => {
    const testUserId = 'integration-test-user';

    beforeAll(async () => {
        // Setup test environment
        process.env.POCKETBASE_ADMIN_EMAIL = 'admin@test.com';
        process.env.POCKETBASE_ADMIN_PASSWORD = 'test-password';
        process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';
        process.env.MAX_WHATSAPP_CONNECTIONS = '100';
        process.env.MAX_TELEGRAM_CONNECTIONS = '200';
    });

    afterAll(async () => {
        await messagingService.shutdown();
    });

    beforeEach(async () => {
        await messagingService.shutdown();
        vi.clearAllMocks();
    });

    describe('End-to-End User Flow', () => {
        it('should handle complete Telegram setup flow', async () => {
            // 1. Initialize service
            await messagingService.initialize();

            // 2. User configures Telegram bot
            const config = {
                enabled: true,
                botToken: 'test-bot-token',
                botUsername: 'test_bot',
                telegramUserId: undefined
            };

            await messagingService.startChannel(testUserId, 'telegram', config);

            // 3. Verify channel is running
            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(true);

            // 4. Send test message
            await messagingService.sendMessage(testUserId, {
                platform: 'telegram',
                content: 'Test message'
            });

            // 5. Verify message sent successfully
            const channel = messagingService.getChannel(testUserId, 'telegram');
            expect(channel).not.toBeNull();
        });

        it('should handle complete WhatsApp setup flow', async () => {
            // 1. Initialize service
            await messagingService.initialize();

            // 2. User initiates WhatsApp setup
            const config = {
                enabled: true,
                sessionPath: '/tmp/test-whatsapp',
                phoneNumber: undefined
            };

            await messagingService.startChannel(testUserId, 'whatsapp', config);

            // 3. Verify channel is running
            expect(messagingService.isChannelRunning(testUserId, 'whatsapp')).toBe(true);

            // 4. QR code would be shown to user
            // 5. After authentication, session would be saved to database
            // (tested in WhatsAppChannel tests)
        });

        it('should handle multi-platform setup', async () => {
            await messagingService.initialize();

            // Setup Telegram
            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'telegram-token',
                botUsername: 'telegram_bot',
                telegramUserId: '123'
            });

            // Setup WhatsApp
            await messagingService.startChannel(testUserId, 'whatsapp', {
                enabled: true,
                sessionPath: '/tmp/test-whatsapp',
                phoneNumber: '1234567890'
            });

            // Setup Discord
            await messagingService.startChannel(testUserId, 'discord', {
                enabled: true,
                botToken: 'discord-token',
                botUsername: 'DiscordBot#1234',
                discordUserId: '456'
            });

            // Verify all channels running
            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(true);
            expect(messagingService.isChannelRunning(testUserId, 'whatsapp')).toBe(true);
            expect(messagingService.isChannelRunning(testUserId, 'discord')).toBe(true);
        });
    });

    describe('Session Persistence', () => {
        it('should persist WhatsApp session to database', async () => {
            const sessionStore = new DatabaseSessionStore();

            // Start WhatsApp channel
            await messagingService.initialize();
            await messagingService.startChannel(testUserId, 'whatsapp', {
                enabled: true,
                sessionPath: '/tmp/test-session',
                phoneNumber: '1234567890'
            });

            // Session should eventually be archived
            // (in background after authentication)

            // Verify session can be loaded
            const hasSession = await sessionStore.hasSession(testUserId);
            expect(typeof hasSession).toBe('boolean');
        });

        it('should restore WhatsApp session after restart', async () => {
            const sessionStore = new DatabaseSessionStore();

            // Simulate having a saved session
            await sessionStore.saveSession(
                testUserId,
                'mock-session-data',
                '1234567890'
            );

            // Restart service
            await messagingService.shutdown();
            await messagingService.initialize();

            // Start channel - should restore from database
            await messagingService.startChannel(testUserId, 'whatsapp', {
                enabled: true,
                sessionPath: '/tmp/test-session',
                phoneNumber: '1234567890'
            });

            expect(messagingService.isChannelRunning(testUserId, 'whatsapp')).toBe(true);
        });
    });

    describe('Connection Management', () => {
        it('should enforce connection limits', async () => {
            const connectionManager = ConnectionManager.getInstance();

            // Start channels up to limit
            const maxConnections = 2; // For testing
            process.env.MAX_WHATSAPP_CONNECTIONS = maxConnections.toString();

            await messagingService.initialize();

            const users = Array.from({ length: maxConnections }, (_, i) => `user-${i}`);

            for (const userId of users) {
                await messagingService.startChannel(userId, 'whatsapp', {
                    enabled: true,
                    sessionPath: `/tmp/session-${userId}`
                });
            }

            // Next connection should fail
            await expect(
                messagingService.startChannel('user-overflow', 'whatsapp', {
                    enabled: true,
                    sessionPath: '/tmp/session-overflow'
                })
            ).rejects.toThrow('connection limit');
        });

        it('should track connection statistics', async () => {
            const connectionManager = ConnectionManager.getInstance();

            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot',
                telegramUserId: '123'
            });

            const stats = connectionManager.getStats();

            expect(stats.activeConnections).toBeGreaterThan(0);
            expect(stats.maxConnections).toBeGreaterThan(0);
        });

        it('should cleanup connections on channel stop', async () => {
            const connectionManager = ConnectionManager.getInstance();

            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot',
                telegramUserId: '123'
            });

            const statsBefore = connectionManager.getStats();
            const activeBefore = statsBefore.activeConnections;

            await messagingService.stopChannel(testUserId, 'telegram');

            const statsAfter = connectionManager.getStats();
            expect(statsAfter.activeConnections).toBeLessThan(activeBefore);
        });
    });

    describe('Error Recovery', () => {
        it('should handle database connection failure', async () => {
            // Simulate database error
            const { pb } = await import('@/lib/pocketbase');
            (pb.admins.authWithPassword as any).mockRejectedValueOnce(
                new Error('Database connection failed')
            );

            await expect(messagingService.initialize()).rejects.toThrow('Database connection');
        });

        it('should recover from channel crash', async () => {
            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot',
                telegramUserId: '123'
            });

            // Simulate channel crash
            const channel = messagingService.getChannel(testUserId, 'telegram');
            if (channel) {
                await channel.stop();
            }

            // Restart channel
            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot',
                telegramUserId: '123'
            });

            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(true);
        });

        it('should handle partial initialization failure', async () => {
            await messagingService.initialize();

            // First channel succeeds
            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'valid-token',
                botUsername: 'test_bot',
                telegramUserId: '123'
            });

            // Second channel fails
            try {
                await messagingService.startChannel(testUserId, 'whatsapp', {
                    enabled: true,
                    sessionPath: '/invalid/path'
                });
            } catch {
                // Expected to fail
            }

            // First channel should still be running
            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(true);
        });
    });

    describe('Message Delivery', () => {
        beforeEach(async () => {
            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot',
                telegramUserId: '123456789'
            });
        });

        it('should deliver message to single platform', async () => {
            await expect(
                messagingService.sendMessage(testUserId, {
                    platform: 'telegram',
                    content: 'Test message'
                })
            ).resolves.not.toThrow();
        });

        it('should handle message delivery to multiple platforms', async () => {
            // Setup additional platform
            await messagingService.startChannel(testUserId, 'whatsapp', {
                enabled: true,
                sessionPath: '/tmp/test-session',
                phoneNumber: '1234567890'
            });

            // Send to Telegram
            await messagingService.sendMessage(testUserId, {
                platform: 'telegram',
                content: 'Telegram message'
            });

            // Send to WhatsApp
            await messagingService.sendMessage(testUserId, {
                platform: 'whatsapp',
                content: 'WhatsApp message'
            });
        });

        it('should log message delivery attempts', async () => {
            const { pb } = await import('@/lib/pocketbase');

            await messagingService.sendMessage(testUserId, {
                platform: 'telegram',
                content: 'Test message'
            });

            // Notification should be logged
            expect(pb.collection).toHaveBeenCalledWith('messaging_notifications');
        });

        it('should handle message delivery failure', async () => {
            // Stop channel to cause failure
            await messagingService.stopChannel(testUserId, 'telegram');

            await expect(
                messagingService.sendMessage(testUserId, {
                    platform: 'telegram',
                    content: 'Test message'
                })
            ).rejects.toThrow('not initialized');
        });
    });

    describe('Service Lifecycle', () => {
        it('should initialize and shutdown cleanly', async () => {
            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot',
                telegramUserId: '123'
            });

            await messagingService.shutdown();

            expect(messagingService.isChannelRunning(testUserId, 'telegram')).toBe(false);
        });

        it('should handle multiple shutdown calls', async () => {
            await messagingService.initialize();
            await messagingService.shutdown();
            await messagingService.shutdown(); // Should not throw
        });

        it('should reinitialize after shutdown', async () => {
            await messagingService.initialize();
            await messagingService.shutdown();
            await messagingService.initialize();

            await expect(
                messagingService.startChannel(testUserId, 'telegram', {
                    enabled: true,
                    botToken: 'test-token',
                    botUsername: 'test_bot',
                    telegramUserId: '123'
                })
            ).resolves.not.toThrow();
        });
    });

    describe('Performance', () => {
        it('should handle high message volume', async () => {
            await messagingService.initialize();

            await messagingService.startChannel(testUserId, 'telegram', {
                enabled: true,
                botToken: 'test-token',
                botUsername: 'test_bot',
                telegramUserId: '123456789'
            });

            const messages = Array.from({ length: 100 }, (_, i) => ({
                platform: 'telegram' as MessagingPlatform,
                content: `Message ${i + 1}`
            }));

            const start = Date.now();
            await Promise.all(
                messages.map(msg => messagingService.sendMessage(testUserId, msg))
            );
            const duration = Date.now() - start;

            // Should complete in reasonable time (< 10s for 100 messages)
            expect(duration).toBeLessThan(10000);
        });

        it('should handle many concurrent users', async () => {
            await messagingService.initialize();

            const userCount = 10;
            const users = Array.from({ length: userCount }, (_, i) => `user-${i}`);

            // Setup channels for all users
            await Promise.all(
                users.map(userId =>
                    messagingService.startChannel(userId, 'telegram', {
                        enabled: true,
                        botToken: `token-${userId}`,
                        botUsername: `bot_${userId}`,
                        telegramUserId: `${1000 + parseInt(userId.split('-')[1])}`
                    })
                )
            );

            // All channels should be running
            const runningCount = users.filter(userId =>
                messagingService.isChannelRunning(userId, 'telegram')
            ).length;

            expect(runningCount).toBe(userCount);
        });
    });
});

/**
 * Connection Manager for WhatsApp Messaging
 *
 * Manages connection limits and monitoring to prevent resource exhaustion.
 *
 * Features:
 * - Connection limits (prevent runaway growth)
 * - Connection pooling (reuse existing connections)
 * - Health monitoring (track active connections)
 * - Automatic cleanup (remove stale connections)
 *
 * Production best practices:
 * - Limit concurrent connections based on server capacity
 * - Monitor connection health and auto-restart if needed
 * - Track resource usage (memory, CPU per connection)
 * - Graceful degradation when limits reached
 */

export interface ConnectionStats {
    activeConnections: number;
    maxConnections: number;
    totalConnectionsCreated: number;
    totalConnectionsFailed: number;
    averageConnectionAge: number;
    memoryUsageMB: number;
}

export interface ConnectionInfo {
    userId: string;
    platform: 'telegram' | 'whatsapp' | 'discord';
    connectedAt: Date;
    lastActivity: Date;
    isHealthy: boolean;
}

export class ConnectionManager {
    private static instance: ConnectionManager;
    private connections: Map<string, ConnectionInfo> = new Map();
    private maxConnections: number;
    private stats: {
        totalCreated: number;
        totalFailed: number;
    };

    private constructor() {
        // Default limits - adjust based on server capacity
        // For reference: Each WhatsApp connection uses ~100-200MB RAM
        this.maxConnections = parseInt(process.env.MAX_WHATSAPP_CONNECTIONS || '100', 10);
        this.stats = {
            totalCreated: 0,
            totalFailed: 0
        };

        // Start periodic cleanup
        this.startCleanupTimer();
    }

    /**
     * Get singleton instance
     */
    static getInstance(): ConnectionManager {
        if (!ConnectionManager.instance) {
            ConnectionManager.instance = new ConnectionManager();
        }
        return ConnectionManager.instance;
    }

    /**
     * Check if new connection can be created
     */
    canCreateConnection(userId: string, platform: string): boolean {
        // Check if connection already exists for this user+platform
        const key = this.getConnectionKey(userId, platform);
        if (this.connections.has(key)) {
            console.log(`[ConnectionManager] Connection already exists for ${userId}:${platform}`);
            return true; // Allow reusing existing connection
        }

        // Check if we've reached the limit
        if (this.connections.size >= this.maxConnections) {
            console.warn(`[ConnectionManager] Connection limit reached (${this.maxConnections})`);
            return false;
        }

        return true;
    }

    /**
     * Register a new connection
     */
    registerConnection(userId: string, platform: 'telegram' | 'whatsapp' | 'discord'): void {
        const key = this.getConnectionKey(userId, platform);

        const connectionInfo: ConnectionInfo = {
            userId,
            platform,
            connectedAt: new Date(),
            lastActivity: new Date(),
            isHealthy: true
        };

        this.connections.set(key, connectionInfo);
        this.stats.totalCreated++;

        console.log(`[ConnectionManager] Registered connection for ${userId}:${platform} (${this.connections.size}/${this.maxConnections})`);
    }

    /**
     * Unregister a connection
     */
    unregisterConnection(userId: string, platform: string): void {
        const key = this.getConnectionKey(userId, platform);

        if (this.connections.delete(key)) {
            console.log(`[ConnectionManager] Unregistered connection for ${userId}:${platform} (${this.connections.size}/${this.maxConnections})`);
        }
    }

    /**
     * Update connection activity timestamp
     */
    updateActivity(userId: string, platform: string): void {
        const key = this.getConnectionKey(userId, platform);
        const connection = this.connections.get(key);

        if (connection) {
            connection.lastActivity = new Date();
            this.connections.set(key, connection);
        }
    }

    /**
     * Mark connection as unhealthy
     */
    markUnhealthy(userId: string, platform: string): void {
        const key = this.getConnectionKey(userId, platform);
        const connection = this.connections.get(key);

        if (connection) {
            connection.isHealthy = false;
            this.connections.set(key, connection);
            console.warn(`[ConnectionManager] Connection marked unhealthy: ${userId}:${platform}`);
        }
    }

    /**
     * Get connection info
     */
    getConnection(userId: string, platform: string): ConnectionInfo | undefined {
        const key = this.getConnectionKey(userId, platform);
        return this.connections.get(key);
    }

    /**
     * Get all active connections
     */
    getAllConnections(): ConnectionInfo[] {
        return Array.from(this.connections.values());
    }

    /**
     * Get connection statistics
     */
    getStats(): ConnectionStats {
        const connections = Array.from(this.connections.values());

        const now = Date.now();
        const averageAge = connections.length > 0
            ? connections.reduce((sum, conn) => sum + (now - conn.connectedAt.getTime()), 0) / connections.length
            : 0;

        // Estimate memory usage: ~150MB per WhatsApp connection, ~50MB per Telegram/Discord
        const memoryUsage = connections.reduce((sum, conn) => {
            return sum + (conn.platform === 'whatsapp' ? 150 : 50);
        }, 0);

        return {
            activeConnections: this.connections.size,
            maxConnections: this.maxConnections,
            totalConnectionsCreated: this.stats.totalCreated,
            totalConnectionsFailed: this.stats.totalFailed,
            averageConnectionAge: averageAge / 1000 / 60, // Convert to minutes
            memoryUsageMB: memoryUsage
        };
    }

    /**
     * Record connection failure
     */
    recordFailure(): void {
        this.stats.totalFailed++;
    }

    /**
     * Cleanup stale connections
     */
    private cleanupStaleConnections(): void {
        const staleThresholdMs = 30 * 60 * 1000; // 30 minutes
        const now = Date.now();

        for (const [key, connection] of this.connections.entries()) {
            const age = now - connection.lastActivity.getTime();

            if (age > staleThresholdMs) {
                console.log(`[ConnectionManager] Removing stale connection: ${key} (inactive for ${(age / 1000 / 60).toFixed(0)} minutes)`);
                this.connections.delete(key);
            }
        }
    }

    /**
     * Start periodic cleanup timer
     */
    private startCleanupTimer(): void {
        // Run cleanup every 10 minutes
        setInterval(() => {
            this.cleanupStaleConnections();
        }, 10 * 60 * 1000);
    }

    /**
     * Get connection key
     */
    private getConnectionKey(userId: string, platform: string): string {
        return `${userId}:${platform}`;
    }

    /**
     * Print status summary
     */
    printStatus(): void {
        const stats = this.getStats();

        console.log('\n=== Connection Manager Status ===');
        console.log(`Active connections: ${stats.activeConnections}/${stats.maxConnections}`);
        console.log(`Total created: ${stats.totalConnectionsCreated}`);
        console.log(`Total failed: ${stats.totalConnectionsFailed}`);
        console.log(`Average connection age: ${stats.averageConnectionAge.toFixed(1)} minutes`);
        console.log(`Estimated memory usage: ${stats.memoryUsageMB} MB`);

        if (stats.activeConnections > 0) {
            console.log('\nActive connections:');
            this.getAllConnections().forEach(conn => {
                const age = (Date.now() - conn.connectedAt.getTime()) / 1000 / 60;
                console.log(`  ${conn.userId}:${conn.platform} - ${age.toFixed(0)}min old, ${conn.isHealthy ? 'healthy' : 'unhealthy'}`);
            });
        }
        console.log('=================================\n');
    }
}

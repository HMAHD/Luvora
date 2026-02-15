# Database-Backed WhatsApp Sessions

## Overview

WhatsApp sessions are now stored in PocketBase database instead of the file system, providing:

- **Session persistence** across deployments and server restarts
- **Horizontal scaling** - sessions accessible from any server instance
- **90% storage reduction** - compressed from 150MB to ~5-10MB per user
- **Production-ready** architecture for handling thousands of users

## Architecture

### Hybrid Approach

```
┌─────────────────────────────────────────────────────────────┐
│                      User connects                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Restore session from database (if exists)               │
│     - Load compressed tarball from whatsapp_sessions        │
│     - Decompress and extract to /tmp/<userId>               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Initialize WhatsApp Web.js client                       │
│     - Uses LocalAuth with /tmp session path                 │
│     - Fast local file access during active use              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. After authentication (ready event)                      │
│     - Archive /tmp/<userId> directory to tarball            │
│     - Compress with gzip (level 9)                          │
│     - Save to database for future restores                  │
└─────────────────────────────────────────────────────────────┘
```

### Storage Comparison

| Approach | Size per user | 1,000 users | 10,000 users | Scalability |
|----------|---------------|-------------|--------------|-------------|
| **Old (file-based)** | 150 MB + 200 files | 150 GB | 1.5 TB | ❌ Poor |
| **New (database)** | 5-10 MB compressed | 10 GB | 100 GB | ✅ Excellent |

## Components

### 1. DatabaseSessionStore

**File:** [`src/lib/messaging/database-session-store.ts`](../src/lib/messaging/database-session-store.ts)

Handles database operations for session storage:

```typescript
const store = new DatabaseSessionStore();

// Save compressed session
await store.saveSession(userId, sessionData, phoneNumber);

// Load session
const sessionData = await store.loadSession(userId);

// Delete session
await store.deleteSession(userId);

// Cleanup old sessions (30+ days inactive)
await store.cleanupOldSessions();
```

**Features:**
- gzip compression (90% size reduction)
- Hybrid caching (memory → file → database)
- Automatic cleanup of inactive sessions
- Storage statistics and monitoring

### 2. SessionArchiver

**File:** [`src/lib/messaging/session-archiver.ts`](../src/lib/messaging/session-archiver.ts)

Archives session directories to compressed tarballs:

```typescript
// Archive a session directory
const archive = await SessionArchiver.archiveSession(sessionPath);
// Returns: { tarballBase64, sizeBytes, compressionRatio }

// Restore session directory
await SessionArchiver.restoreSession(tarballBase64, targetPath);

// Check if session is valid
const isValid = SessionArchiver.hasValidSession(sessionPath);
```

**Technical details:**
- Uses `tar` + `gzip` for compression
- Base64 encoding for database storage
- Validates session integrity
- Handles serverless environments (/tmp)

### 3. ConnectionManager

**File:** [`src/lib/messaging/connection-manager.ts`](../src/lib/messaging/connection-manager.ts)

Manages connection limits and monitoring:

```typescript
const manager = ConnectionManager.getInstance();

// Check if new connection allowed
if (!manager.canCreateConnection(userId, 'whatsapp')) {
    throw new Error('Connection limit reached');
}

// Register active connection
manager.registerConnection(userId, 'whatsapp');

// Get statistics
const stats = manager.getStats();
console.log(`Active: ${stats.activeConnections}/${stats.maxConnections}`);
console.log(`Memory: ${stats.memoryUsageMB} MB`);
```

**Features:**
- Configurable connection limits (default: 100)
- Automatic stale connection cleanup
- Memory usage estimation
- Health monitoring

### 4. WhatsAppChannel (Updated)

**File:** [`src/lib/messaging/channels/whatsapp-channel.ts`](../src/lib/messaging/channels/whatsapp-channel.ts)

Integrated database-backed sessions:

- `restoreSessionFromDatabase()` - Called before client initialization
- `archiveSessionToDatabase()` - Called after authentication
- Connection manager integration
- Automatic session persistence

## Database Schema

### whatsapp_sessions Collection

Created by migration: [`pocketbase/pb_migrations/1739630000_create_whatsapp_sessions.js`](../pocketbase/pb_migrations/1739630000_create_whatsapp_sessions.js)

**Fields:**
- `user` (relation) - Links to users collection
- `session_data` (text) - Compressed tarball (base64)
- `compressed` (bool) - Compression flag
- `phone_number` (text) - WhatsApp phone number
- `last_active` (date) - Last activity timestamp
- `size_bytes` (number) - Compressed size
- `metadata` (json) - Additional metadata

**Indexes:**
- Unique index on `user`
- Index on `last_active` (for cleanup queries)
- Index on `phone_number`

**Rules:**
- Users can only access their own sessions
- Automatic cascade delete when user is deleted

## Deployment Guide

### 1. Apply Database Migration

The PocketBase migration will be automatically applied on next startup.

To manually apply:
```bash
# PocketBase will automatically run migrations from pb_migrations/
# Just restart PocketBase
./pocketbase serve
```

### 2. Migrate Existing Sessions

If you have existing file-based sessions in `.whatsapp-sessions/`:

```bash
# Dry run (preview what will happen)
npx tsx scripts/migrate-whatsapp-sessions.ts

# Execute migration
npx tsx scripts/migrate-whatsapp-sessions.ts --execute

# Execute and delete original files
npx tsx scripts/migrate-whatsapp-sessions.ts --execute --delete
```

**Migration script:** [`scripts/migrate-whatsapp-sessions.ts`](../scripts/migrate-whatsapp-sessions.ts)

### 3. Configure Connection Limits

Set environment variable to control max concurrent connections:

```bash
# .env
MAX_WHATSAPP_CONNECTIONS=100  # Adjust based on server capacity
```

**Capacity planning:**
- Each WhatsApp connection: ~150MB RAM
- 100 connections: ~15GB RAM
- 1000 connections: ~150GB RAM

### 4. Session Cleanup (Recommended)

Add a cron job to cleanup inactive sessions:

```typescript
// In your scheduled tasks (e.g., cron job, Vercel Cron)
import { DatabaseSessionStore } from '@/lib/messaging/database-session-store';

export async function cleanupSessions() {
    const store = new DatabaseSessionStore();
    const deleted = await store.cleanupOldSessions(30); // 30 days
    console.log(`Cleaned up ${deleted} inactive sessions`);
}
```

**Example with Vercel Cron:**

```typescript
// app/api/cron/cleanup-sessions/route.ts
import { NextResponse } from 'next/server';
import { DatabaseSessionStore } from '@/lib/messaging/database-session-store';

export async function GET(request: Request) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = new DatabaseSessionStore();
    const deleted = await store.cleanupOldSessions(30);

    return NextResponse.json({
        success: true,
        deletedSessions: deleted
    });
}
```

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup-sessions",
    "schedule": "0 2 * * *"  // Daily at 2 AM
  }]
}
```

## Monitoring

### Get Storage Statistics

```typescript
import { DatabaseSessionStore } from '@/lib/messaging/database-session-store';

const store = new DatabaseSessionStore();
const stats = await store.getStorageStats();

console.log(`Total sessions: ${stats.totalSessions}`);
console.log(`Total size: ${(stats.totalSizeBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`Average size: ${(stats.averageSizeBytes / 1024 / 1024).toFixed(2)} MB`);
```

### Monitor Connections

```typescript
import { ConnectionManager } from '@/lib/messaging/connection-manager';

const manager = ConnectionManager.getInstance();
manager.printStatus();

// Output:
// === Connection Manager Status ===
// Active connections: 42/100
// Total created: 156
// Total failed: 3
// Average connection age: 23.5 minutes
// Estimated memory usage: 6300 MB
```

### Health Check API

Create a monitoring endpoint:

```typescript
// app/api/health/whatsapp/route.ts
import { NextResponse } from 'next/server';
import { ConnectionManager } from '@/lib/messaging/connection-manager';
import { DatabaseSessionStore } from '@/lib/messaging/database-session-store';

export async function GET() {
    const connectionStats = ConnectionManager.getInstance().getStats();
    const store = new DatabaseSessionStore();
    const storageStats = await store.getStorageStats();

    return NextResponse.json({
        connections: {
            active: connectionStats.activeConnections,
            max: connectionStats.maxConnections,
            utilizationPercent: (connectionStats.activeConnections / connectionStats.maxConnections * 100).toFixed(1),
            memoryUsageMB: connectionStats.memoryUsageMB
        },
        storage: {
            totalSessions: storageStats.totalSessions,
            totalSizeMB: (storageStats.totalSizeBytes / 1024 / 1024).toFixed(2),
            averageSizeMB: (storageStats.averageSizeBytes / 1024 / 1024).toFixed(2)
        },
        healthy: connectionStats.activeConnections < connectionStats.maxConnections * 0.9
    });
}
```

## Troubleshooting

### Sessions Not Persisting

**Symptom:** Users must scan QR code after every deployment

**Solution:**
1. Check database migration applied: Look for `whatsapp_sessions` collection in PocketBase
2. Verify session archiving logs: Look for "Session archived to database" in logs
3. Check PocketBase connectivity from app server

### Connection Limit Reached

**Symptom:** Error "Maximum WhatsApp connections reached"

**Solutions:**
1. Increase `MAX_WHATSAPP_CONNECTIONS` environment variable
2. Run cleanup to remove stale connections:
   ```typescript
   ConnectionManager.getInstance().cleanupStaleConnections();
   ```
3. Scale horizontally (add more server instances)

### High Memory Usage

**Symptom:** Server running out of memory

**Solutions:**
1. Reduce `MAX_WHATSAPP_CONNECTIONS`
2. Implement more aggressive cleanup
3. Monitor with ConnectionManager and set alerts
4. Consider upgrading server RAM

### Session Restore Failures

**Symptom:** Logs show "Failed to restore session from database"

**Debug steps:**
1. Check session exists: `await store.hasSession(userId)`
2. Verify session data integrity in database
3. Check /tmp directory permissions
4. Look for tar/gzip errors in logs

## Performance Optimization

### 1. Database Indexing

Already optimized with indexes on:
- `user` (unique) - Fast user lookup
- `last_active` - Fast cleanup queries
- `phone_number` - Quick phone number searches

### 2. Caching Strategy

Three-tier caching:
1. **Memory** - In-process cache (fastest)
2. **File** - /tmp cache (fast, serverless-safe)
3. **Database** - PocketBase (persistent)

### 3. Compression Tuning

Current: gzip level 9 (maximum compression)

Trade-offs:
- Level 9: Best compression, slower (5-10 MB, ~2s)
- Level 6: Balanced (7-12 MB, ~0.5s)
- Level 1: Fastest, larger (15-20 MB, ~0.1s)

To adjust, edit [`src/lib/messaging/session-archiver.ts:79`](../src/lib/messaging/session-archiver.ts#L79):
```typescript
const compressed = gzipSync(tarball, { level: 6 }); // Change from 9 to 6
```

## Security Considerations

### Access Control

- Sessions are tied to user accounts
- PocketBase rules prevent cross-user access
- API routes verify authentication before session operations

### Data Protection

- Sessions contain authentication tokens
- Stored encrypted at rest (PocketBase database encryption)
- Transmitted over HTTPS only
- Automatic cleanup of inactive sessions reduces exposure

### Production Checklist

- [ ] Database migration applied
- [ ] Existing sessions migrated
- [ ] Connection limits configured
- [ ] Cleanup cron job scheduled
- [ ] Monitoring/health checks implemented
- [ ] Alerts configured for high usage
- [ ] Backup strategy for PocketBase database
- [ ] HTTPS enforced for all endpoints
- [ ] Environment variables secured

## Future Enhancements

### Considered for Future

1. **Multi-region support** - Replicate sessions across regions
2. **Session pooling** - Reuse connections for multiple users
3. **Lazy loading** - Only restore sessions when needed
4. **Progressive compression** - Compress more aggressively over time
5. **S3/R2 storage** - Offload to object storage for very large deployments

## References

- [WHATSAPP_STORAGE_SOLUTION.md](../WHATSAPP_STORAGE_SOLUTION.md) - Original problem analysis
- [whatsapp-web.js Documentation](https://wwebjs.dev/)
- [PocketBase Documentation](https://pocketbase.io/docs/)

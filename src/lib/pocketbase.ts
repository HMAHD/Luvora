import PocketBase, { BaseAuthStore } from 'pocketbase';

/**
 * Memory-only auth store — does NOT persist to localStorage.
 * This prevents auth tokens from being exfiltrable via XSS.
 * Auth state is restored from the httpOnly pb_auth cookie on the server side.
 */
class MemoryAuthStore extends BaseAuthStore {
    save(token: string, record?: unknown): void {
        super.save(token, record);
    }
    clear(): void {
        super.clear();
    }
}

// Singleton instance to prevent multiple connections in dev
const globalForPB = global as unknown as { pb: PocketBase };

export const pb = globalForPB.pb || new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://api.luvora.love',
    new MemoryAuthStore(),
);

if (process.env.NODE_ENV !== 'production') globalForPB.pb = pb;

pb.autoCancellation(false); // Disable auto-cancellation for simpler logic

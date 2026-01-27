import PocketBase from 'pocketbase';

// Singleton instance to prevent multiple connections in dev
const globalForPB = global as unknown as { pb: PocketBase };

export const pb = globalForPB.pb || new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090');

if (process.env.NODE_ENV !== 'production') globalForPB.pb = pb;

pb.autoCancellation(false); // Disable auto-cancellation for simpler logic

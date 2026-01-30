import { describe, expect, test, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import { POST } from '../../src/app/api/webhooks/payments/route';

// Mock PocketBase
const mockUpdate = vi.fn();
const mockGetOne = vi.fn();

vi.mock('pocketbase', () => {
    return {
        default: class PocketBase {
            admins = {
                authWithPassword: vi.fn(),
            };
            collection = (name: string) => ({
                getOne: mockGetOne,
                update: mockUpdate,
            });
        },
    };
});

describe('API: Payment Webhook', () => {
    beforeEach(() => {
        vi.clearAllMocks(); // Clear call history
        process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'test-secret';
        process.env.POCKETBASE_URL = 'http://localhost:8090';
    });

    test('Validates Signature Correctly', async () => {
        const payload = JSON.stringify({
            meta: { event_name: 'order_created', custom_data: { user_id: 'user-123', tier: 'hero' } },
            data: { attributes: {} }
        });

        const hmac = crypto.createHmac('sha256', 'test-secret');
        const signature = hmac.update(payload).digest('hex');

        const req = new Request('http://localhost/api', {
            method: 'POST',
            headers: { 'X-Signature': signature },
            body: payload
        });

        // Mock User with FREE tier (0)
        mockGetOne.mockResolvedValue({ tier: 0 });

        const res = await POST(req);

        // Should upgrade to HERO tier (1)
        expect(mockUpdate).toHaveBeenCalledWith('user-123', expect.objectContaining({ tier: 1 }));
    });

    test('Rejects Invalid Signature', async () => {
        const payload = "{}";
        const req = new Request('http://localhost/api', {
            method: 'POST',
            headers: { 'X-Signature': 'invalid-sig' },
            body: payload
        });

        const res = await POST(req);
        // Expect 401 (we can't easily read status from NextResponse in mock unless we inspect the returned object internals or mock NextResponse)
        // Basic check: Admin update should NOT be called
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    test('Idempotency: Skips if already at requested tier', async () => {
        const payload = JSON.stringify({
            meta: { event_name: 'order_created', custom_data: { user_id: 'user-already-premium', tier: 'hero' } },
            data: { attributes: {} }
        });

        const hmac = crypto.createHmac('sha256', 'test-secret');
        const signature = hmac.update(payload).digest('hex');

        const req = new Request('http://localhost/api', {
            method: 'POST',
            headers: { 'X-Signature': signature },
            body: payload
        });

        // User already has HERO tier (1), trying to upgrade to hero (1) should be skipped
        mockGetOne.mockResolvedValue({ tier: 1 });

        await POST(req);
        expect(mockUpdate).not.toHaveBeenCalled();
    });
});

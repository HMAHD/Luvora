/**
 * Server-side Google Analytics 4 Tracking
 * Uses GA4 Measurement Protocol for backend events
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
const GA_API_SECRET = process.env.GA_API_SECRET || '';
const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

interface GA4Event {
  name: string;
  params?: Record<string, unknown>;
}

/**
 * Send event to GA4 using Measurement Protocol
 */
export async function trackServerEvent(
  clientId: string,
  events: GA4Event[],
  userId?: string
): Promise<void> {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
    console.log('[Analytics] Server tracking disabled - missing GA credentials');
    return;
  }

  try {
    const payload = {
      client_id: clientId,
      user_id: userId,
      events: events.map(event => ({
        name: event.name,
        params: {
          ...event.params,
          engagement_time_msec: 100,
          session_id: Date.now().toString(),
        },
      })),
    };

    const response = await fetch(
      `${GA_ENDPOINT}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('[Analytics] Server tracking failed:', response.status);
    }
  } catch (error) {
    console.error('[Analytics] Server tracking error:', error);
  }
}

/**
 * Track successful upgrade/purchase
 */
export async function trackUpgradeCompletedServer(params: {
  userId: string;
  fromTier: number;
  toTier: number;
  planType: 'hero' | 'legend';
  value: number;
  transactionId: string;
}): Promise<void> {
  const clientId = `server_${params.userId}`;

  await trackServerEvent(
    clientId,
    [
      {
        name: 'purchase',
        params: {
          transaction_id: params.transactionId,
          value: params.value,
          currency: 'USD',
          items: [{
            item_id: params.planType,
            item_name: params.planType === 'hero' ? 'Hero Plan' : 'Legend Plan',
            price: params.value,
            quantity: 1,
          }],
        },
      },
      {
        name: 'upgrade_completed',
        params: {
          from_tier: params.fromTier,
          to_tier: params.toTier,
          plan_type: params.planType,
          value: params.value,
        },
      },
    ],
    params.userId
  );
}

/**
 * Track automation message delivery
 */
export async function trackAutomationDeliveryServer(params: {
  userId: string;
  platform: 'telegram' | 'whatsapp';
  status: 'success' | 'failed';
}): Promise<void> {
  const clientId = `server_${params.userId}`;

  await trackServerEvent(
    clientId,
    [{
      name: 'automation_delivered',
      params: {
        platform: params.platform,
        status: params.status,
      },
    }],
    params.userId
  );
}

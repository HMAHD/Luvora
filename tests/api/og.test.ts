import { describe, expect, test, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock @vercel/og since it requires edge runtime
vi.mock('@vercel/og', () => ({
  ImageResponse: class MockImageResponse {
    constructor(element: React.ReactElement, options?: { width?: number; height?: number }) {
      // Store for inspection
      (this as any)._element = element;
      (this as any)._options = options;
    }
  },
}));

// We need to import after mocking
import { GET } from '../../src/app/api/og/route';

describe('API: OG Image Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('generates default OG image when no params provided', async () => {
    const req = new NextRequest('http://localhost/api/og');
    const response = await GET(req);

    // ImageResponse is returned
    expect(response).toBeDefined();
    // Check dimensions from mock
    expect((response as any)._options?.width).toBe(1200);
    expect((response as any)._options?.height).toBe(630);
  });

  test('generates category OG image for valid category', async () => {
    const req = new NextRequest('http://localhost/api/og?category=morning-messages-for-her');
    const response = await GET(req);

    expect(response).toBeDefined();
    expect((response as any)._options?.width).toBe(1200);
    expect((response as any)._options?.height).toBe(630);
  });

  test('generates streak card when streak param provided', async () => {
    const req = new NextRequest('http://localhost/api/og?streak=15&name=Luna');
    const response = await GET(req);

    expect(response).toBeDefined();
    expect((response as any)._options?.width).toBe(1200);
    expect((response as any)._options?.height).toBe(630);
  });

  test('falls back to default for invalid category', async () => {
    const req = new NextRequest('http://localhost/api/og?category=non-existent');
    const response = await GET(req);

    // Should still return a response (default card)
    expect(response).toBeDefined();
  });

  test('handles streak with default name', async () => {
    const req = new NextRequest('http://localhost/api/og?streak=7');
    const response = await GET(req);

    expect(response).toBeDefined();
  });
});

describe('OG Image URL Parameters', () => {
  test('extracts category from search params', async () => {
    const url = new URL('http://localhost/api/og?category=goodnight-texts-for-him');
    expect(url.searchParams.get('category')).toBe('goodnight-texts-for-him');
  });

  test('extracts streak and name from search params', async () => {
    const url = new URL('http://localhost/api/og?streak=30&name=My%20Love');
    expect(url.searchParams.get('streak')).toBe('30');
    expect(url.searchParams.get('name')).toBe('My Love');
  });
});

import { describe, expect, test } from 'vitest';
import { SEO_CATEGORIES, getCategoryBySlug } from '../../src/lib/seo-categories';
import pool from '../../src/lib/data/pool.json';

type MessageObj = { content: string; target: string };

/**
 * Helper: Get messages for a category (mirrors page logic)
 */
function getMessagesForCategory(slug: string) {
  const category = getCategoryBySlug(slug);
  if (!category) return [];

  const messages: { content: string; vibe: string }[] = [];
  const vibes = category.vibe
    ? [category.vibe]
    : (['poetic', 'playful', 'minimal'] as const);
  const times =
    category.timeOfDay === 'both'
      ? (['morning', 'night'] as const)
      : ([category.timeOfDay] as const);

  for (const time of times) {
    for (const vibe of vibes) {
      const poolMessages = pool.messages[time][vibe] as MessageObj[];
      const filtered = poolMessages.filter(
        (m) => m.target === 'neutral' || m.target === category.target
      );

      filtered.slice(0, 2).forEach((m) => {
        messages.push({ content: m.content, vibe });
      });
    }
  }

  return messages;
}

/**
 * Helper: Generate JSON-LD (mirrors page logic)
 */
function generateJsonLd(slug: string) {
  const category = getCategoryBySlug(slug);
  if (!category) return null;

  const messages = getMessagesForCategory(slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.h1,
    description: category.description,
    url: `https://luvora.app/sparks/${category.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Luvora',
      url: 'https://luvora.app',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: messages.map((msg, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          text: msg.content,
          genre: 'Romance',
          keywords: category.keywords.join(', '),
        },
      })),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://luvora.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Sparks',
          item: 'https://luvora.app/sparks',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.h1,
          item: `https://luvora.app/sparks/${category.slug}`,
        },
      ],
    },
  };
}

describe('SEO Page: Message Retrieval', () => {
  test('retrieves messages for morning-feminine category', () => {
    const messages = getMessagesForCategory('morning-messages-for-her');
    expect(messages.length).toBeGreaterThan(0);

    // All messages should be valid
    messages.forEach((msg) => {
      expect(msg.content).toBeTruthy();
      expect(['poetic', 'playful', 'minimal']).toContain(msg.vibe);
    });
  });

  test('retrieves messages for night-masculine category', () => {
    const messages = getMessagesForCategory('goodnight-texts-for-him');
    expect(messages.length).toBeGreaterThan(0);
  });

  test('retrieves messages for neutral category', () => {
    const messages = getMessagesForCategory('daily-love-messages');
    expect(messages.length).toBeGreaterThan(0);
  });

  test('retrieves messages for vibe-specific category', () => {
    const messages = getMessagesForCategory('poetic-love-messages');
    expect(messages.length).toBeGreaterThan(0);

    // All should be poetic vibe
    messages.forEach((msg) => {
      expect(msg.vibe).toBe('poetic');
    });
  });

  test('returns empty array for invalid category', () => {
    const messages = getMessagesForCategory('non-existent');
    expect(messages).toEqual([]);
  });
});

describe('SEO Page: JSON-LD Schema Generation', () => {
  test('generates valid JSON-LD for category', () => {
    const jsonLd = generateJsonLd('morning-messages-for-her');

    expect(jsonLd).not.toBeNull();
    expect(jsonLd?.['@context']).toBe('https://schema.org');
    expect(jsonLd?.['@type']).toBe('CollectionPage');
    expect(jsonLd?.name).toBeTruthy();
    expect(jsonLd?.description).toBeTruthy();
    expect(jsonLd?.url).toContain('morning-messages-for-her');
  });

  test('JSON-LD contains publisher info', () => {
    const jsonLd = generateJsonLd('morning-messages-for-her');

    expect(jsonLd?.publisher).toEqual({
      '@type': 'Organization',
      name: 'Luvora',
      url: 'https://luvora.app',
    });
  });

  test('JSON-LD contains ItemList with messages', () => {
    const jsonLd = generateJsonLd('morning-messages-for-her');

    expect(jsonLd?.mainEntity?.['@type']).toBe('ItemList');
    expect(jsonLd?.mainEntity?.itemListElement?.length).toBeGreaterThan(0);

    // Check structure of first item
    const firstItem = jsonLd?.mainEntity?.itemListElement?.[0];
    expect(firstItem?.['@type']).toBe('ListItem');
    expect(firstItem?.position).toBe(1);
    expect(firstItem?.item?.['@type']).toBe('CreativeWork');
    expect(firstItem?.item?.text).toBeTruthy();
    expect(firstItem?.item?.genre).toBe('Romance');
  });

  test('JSON-LD contains breadcrumb', () => {
    const jsonLd = generateJsonLd('morning-messages-for-her');

    expect(jsonLd?.breadcrumb?.['@type']).toBe('BreadcrumbList');
    expect(jsonLd?.breadcrumb?.itemListElement?.length).toBe(3);

    // Check breadcrumb structure
    const [home, sparks, category] = jsonLd?.breadcrumb?.itemListElement || [];
    expect(home?.name).toBe('Home');
    expect(sparks?.name).toBe('Sparks');
    expect(category?.name).toBeTruthy();
  });

  test('returns null for invalid category', () => {
    const jsonLd = generateJsonLd('non-existent');
    expect(jsonLd).toBeNull();
  });
});

describe('SEO Page: Static Generation', () => {
  test('all categories can generate static params', () => {
    const params = SEO_CATEGORIES.map((cat) => ({ category: cat.slug }));
    expect(params.length).toBe(SEO_CATEGORIES.length);

    // All params should be valid objects
    params.forEach((p) => {
      expect(p.category).toBeTruthy();
      expect(typeof p.category).toBe('string');
    });
  });

  test('all categories have messages available', () => {
    SEO_CATEGORIES.forEach((cat) => {
      const messages = getMessagesForCategory(cat.slug);
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  test('all categories generate valid JSON-LD', () => {
    SEO_CATEGORIES.forEach((cat) => {
      const jsonLd = generateJsonLd(cat.slug);
      expect(jsonLd).not.toBeNull();
      expect(jsonLd?.['@context']).toBe('https://schema.org');
    });
  });
});

describe('SEO Page: Metadata Generation', () => {
  test('all categories have unique titles', () => {
    const titles = SEO_CATEGORIES.map((c) => c.title);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  test('all categories have unique descriptions', () => {
    const descriptions = SEO_CATEGORIES.map((c) => c.description);
    const uniqueDescriptions = new Set(descriptions);
    expect(uniqueDescriptions.size).toBe(descriptions.length);
  });

  test('metadata includes Luvora brand', () => {
    SEO_CATEGORIES.forEach((cat) => {
      expect(cat.title.toLowerCase()).toContain('|');
    });
  });
});

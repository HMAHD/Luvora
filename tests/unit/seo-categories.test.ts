import { describe, expect, test } from 'vitest';
import {
  SEO_CATEGORIES,
  getCategoryBySlug,
  getAllCategorySlugs,
  type SEOCategory,
} from '../../src/lib/seo-categories';

describe('SEO Categories Configuration', () => {
  test('has sufficient categories for programmatic SEO (35+)', () => {
    expect(SEO_CATEGORIES.length).toBeGreaterThanOrEqual(35);
  });

  test('all categories have unique slugs', () => {
    const slugs = SEO_CATEGORIES.map((cat) => cat.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  test('all categories have required fields', () => {
    SEO_CATEGORIES.forEach((cat) => {
      expect(cat.slug).toBeTruthy();
      expect(cat.title).toBeTruthy();
      expect(cat.description).toBeTruthy();
      expect(cat.h1).toBeTruthy();
      expect(cat.keywords).toBeInstanceOf(Array);
      expect(cat.keywords.length).toBeGreaterThan(0);
      expect(['morning', 'night', 'both']).toContain(cat.timeOfDay);
      expect(['neutral', 'feminine', 'masculine']).toContain(cat.target);
    });
  });

  test('slugs are URL-safe (no spaces, lowercase)', () => {
    SEO_CATEGORIES.forEach((cat) => {
      expect(cat.slug).toMatch(/^[a-z0-9-]+$/);
      expect(cat.slug).not.toContain(' ');
    });
  });

  test('titles are SEO-optimized (under 70 characters)', () => {
    SEO_CATEGORIES.forEach((cat) => {
      // Title should be under 70 chars for Google SERPs
      expect(cat.title.length).toBeLessThanOrEqual(70);
    });
  });

  test('descriptions are SEO-optimized (under 160 characters)', () => {
    SEO_CATEGORIES.forEach((cat) => {
      // Meta description should be under 160 chars
      expect(cat.description.length).toBeLessThanOrEqual(160);
    });
  });
});

describe('getCategoryBySlug', () => {
  test('returns category for valid slug', () => {
    const cat = getCategoryBySlug('morning-messages-for-her');
    expect(cat).toBeDefined();
    expect(cat?.slug).toBe('morning-messages-for-her');
    expect(cat?.target).toBe('feminine');
    expect(cat?.timeOfDay).toBe('morning');
  });

  test('returns undefined for invalid slug', () => {
    const cat = getCategoryBySlug('non-existent-category');
    expect(cat).toBeUndefined();
  });

  test('returns category with correct structure', () => {
    const cat = getCategoryBySlug('goodnight-texts-for-him');
    expect(cat).toMatchObject({
      slug: 'goodnight-texts-for-him',
      target: 'masculine',
      timeOfDay: 'night',
    });
  });
});

describe('getAllCategorySlugs', () => {
  test('returns all slugs', () => {
    const slugs = getAllCategorySlugs();
    expect(slugs.length).toBe(SEO_CATEGORIES.length);
  });

  test('returns strings only', () => {
    const slugs = getAllCategorySlugs();
    slugs.forEach((slug) => {
      expect(typeof slug).toBe('string');
    });
  });
});

describe('SEO Category Coverage', () => {
  test('has morning messages for her', () => {
    const morningHer = SEO_CATEGORIES.filter(
      (c) => c.timeOfDay === 'morning' && c.target === 'feminine'
    );
    expect(morningHer.length).toBeGreaterThanOrEqual(2);
  });

  test('has morning messages for him', () => {
    const morningHim = SEO_CATEGORIES.filter(
      (c) => c.timeOfDay === 'morning' && c.target === 'masculine'
    );
    expect(morningHim.length).toBeGreaterThanOrEqual(2);
  });

  test('has goodnight messages for her', () => {
    const nightHer = SEO_CATEGORIES.filter(
      (c) => c.timeOfDay === 'night' && c.target === 'feminine'
    );
    expect(nightHer.length).toBeGreaterThanOrEqual(2);
  });

  test('has goodnight messages for him', () => {
    const nightHim = SEO_CATEGORIES.filter(
      (c) => c.timeOfDay === 'night' && c.target === 'masculine'
    );
    expect(nightHim.length).toBeGreaterThanOrEqual(2);
  });

  test('has neutral/general categories', () => {
    const neutral = SEO_CATEGORIES.filter((c) => c.target === 'neutral');
    expect(neutral.length).toBeGreaterThanOrEqual(5);
  });

  test('has vibe-based categories', () => {
    const vibeCategories = SEO_CATEGORIES.filter((c) => c.vibe !== undefined);
    expect(vibeCategories.length).toBeGreaterThanOrEqual(3);
  });
});

describe('SEO Keyword Quality', () => {
  test('keywords contain high-intent search terms', () => {
    const allKeywords = SEO_CATEGORIES.flatMap((c) => c.keywords);

    // Check for presence of high-intent terms
    const highIntentTerms = [
      'good morning',
      'goodnight',
      'texts',
      'messages',
      'girlfriend',
      'boyfriend',
      'wife',
      'husband',
    ];

    highIntentTerms.forEach((term) => {
      const found = allKeywords.some((kw) => kw.toLowerCase().includes(term));
      expect(found).toBe(true);
    });
  });

  test('each category has 3+ keywords', () => {
    SEO_CATEGORIES.forEach((cat) => {
      expect(cat.keywords.length).toBeGreaterThanOrEqual(3);
    });
  });
});

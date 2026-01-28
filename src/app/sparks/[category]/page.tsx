import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryHero } from '@/components/CategoryHero';
import { SEO_CATEGORIES, getCategoryBySlug, getAllCategorySlugs } from '@/lib/seo-categories';
import pool from '@/lib/data/pool.json';

type Props = {
  params: Promise<{ category: string }>;
};

/**
 * Generate static params for all SEO category pages
 * This pre-renders 50+ high-traffic category pages at build time
 */
export async function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({
    category: slug,
  }));
}

/**
 * Generate dynamic metadata for each category page
 * Unique titles, descriptions, and keywords for SEO
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Page Not Found | Luvora',
    };
  }

  return {
    title: category.title,
    description: category.description,
    keywords: category.keywords,
    openGraph: {
      title: category.title,
      description: category.description,
      type: 'website',
      siteName: 'Luvora',
      images: [
        {
          url: `/api/og?category=${slug}`,
          width: 1200,
          height: 630,
          alt: category.h1,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.title,
      description: category.description,
      images: [`/api/og?category=${slug}`],
    },
    alternates: {
      canonical: `/sparks/${slug}`,
    },
  };
}

/**
 * Get curated message previews for a category
 */
function getMessagesForCategory(category: ReturnType<typeof getCategoryBySlug>) {
  if (!category) return [];

  type MessageObj = { content: string; target: string };
  const messages: { content: string; vibe: string }[] = [];
  const vibes = category.vibe ? [category.vibe] : ['poetic', 'playful', 'minimal'] as const;
  const times = category.timeOfDay === 'both'
    ? ['morning', 'night'] as const
    : [category.timeOfDay] as const;

  for (const time of times) {
    for (const vibe of vibes) {
      const poolMessages = pool.messages[time][vibe] as MessageObj[];
      const filtered = poolMessages.filter(
        (m) => m.target === 'neutral' || m.target === category.target
      );

      // Take up to 2 messages from each vibe/time combo
      filtered.slice(0, 2).forEach((m) => {
        messages.push({ content: m.content, vibe });
      });
    }
  }

  // Shuffle and limit to 8 messages for display
  return messages
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);
}

/**
 * JSON-LD Structured Data for Rich Snippets
 */
function generateJsonLd(category: ReturnType<typeof getCategoryBySlug>, messages: { content: string; vibe: string }[]) {
  if (!category) return null;

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

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const messages = getMessagesForCategory(category);
  const jsonLd = generateJsonLd(category, messages);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Content */}
      <CategoryHero category={category} messages={messages} />
    </>
  );
}

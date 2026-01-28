import { Metadata } from 'next';
import Link from 'next/link';
import { SEO_CATEGORIES } from '@/lib/seo-categories';
import { Sun, Moon, Heart, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Love Message Categories | Luvora Sparks',
  description: 'Browse our collection of romantic messages. Good morning texts, goodnight messages, love quotes for her and him. Find the perfect words for your partner.',
  keywords: ['love messages', 'romantic texts', 'good morning messages', 'goodnight texts', 'love quotes'],
  openGraph: {
    title: 'Love Message Categories | Luvora Sparks',
    description: 'Browse our collection of romantic messages. Find the perfect words for your partner.',
    type: 'website',
    siteName: 'Luvora',
  },
};

// Group categories by type
function groupCategories() {
  const morningHer = SEO_CATEGORIES.filter(c => c.timeOfDay === 'morning' && c.target === 'feminine');
  const morningHim = SEO_CATEGORIES.filter(c => c.timeOfDay === 'morning' && c.target === 'masculine');
  const morningNeutral = SEO_CATEGORIES.filter(c => c.timeOfDay === 'morning' && c.target === 'neutral');
  const nightHer = SEO_CATEGORIES.filter(c => c.timeOfDay === 'night' && c.target === 'feminine');
  const nightHim = SEO_CATEGORIES.filter(c => c.timeOfDay === 'night' && c.target === 'masculine');
  const nightNeutral = SEO_CATEGORIES.filter(c => c.timeOfDay === 'night' && c.target === 'neutral');
  const general = SEO_CATEGORIES.filter(c => c.timeOfDay === 'both');

  return { morningHer, morningHim, morningNeutral, nightHer, nightHim, nightNeutral, general };
}

function CategorySection({
  title,
  icon: Icon,
  categories
}: {
  title: string;
  icon: React.ElementType;
  categories: typeof SEO_CATEGORIES;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-base-content mb-6 flex items-center gap-3">
        <Icon className="w-6 h-6 text-primary" />
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/sparks/${cat.slug}`}
            className="bg-base-100 border border-base-content/10 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <h3 className="font-medium text-base-content group-hover:text-primary transition-colors">
              {cat.h1}
            </h3>
            <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function SparksIndexPage() {
  const groups = groupCategories();

  // JSON-LD for the index page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Love Message Categories',
    description: 'Browse romantic messages for every occasion',
    url: 'https://luvora.app/sparks',
    publisher: {
      '@type': 'Organization',
      name: 'Luvora',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: SEO_CATEGORIES.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: cat.h1,
        url: `https://luvora.app/sparks/${cat.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-base-200">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-base-100 border border-base-content/10 px-4 py-2 rounded-full text-sm mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-base-content/70">{SEO_CATEGORIES.length}+ Categories</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-romantic text-base-content mb-4">
              Love Message Categories
            </h1>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto mb-8">
              Find the perfect words for any moment. Browse our curated collection of romantic messages.
            </p>

            <Link href="/" className="btn btn-primary btn-lg shadow-lg">
              Get Today&apos;s Spark
            </Link>
          </div>
        </section>

        {/* Categories */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <CategorySection title="Morning Messages for Her" icon={Sun} categories={groups.morningHer} />
          <CategorySection title="Morning Messages for Him" icon={Sun} categories={groups.morningHim} />
          <CategorySection title="Morning Messages" icon={Sun} categories={groups.morningNeutral} />

          <CategorySection title="Goodnight Messages for Her" icon={Moon} categories={groups.nightHer} />
          <CategorySection title="Goodnight Messages for Him" icon={Moon} categories={groups.nightHim} />
          <CategorySection title="Goodnight Messages" icon={Moon} categories={groups.nightNeutral} />

          <CategorySection title="General Love Messages" icon={Heart} categories={groups.general} />
        </div>

        {/* Footer CTA */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-romantic text-base-content mb-4">
              Never Run Out of Words
            </h2>
            <p className="text-base-content/70 mb-6">
              Get a fresh, unique message every day. Your partner will never see it coming.
            </p>
            <Link href="/" className="btn btn-primary btn-lg shadow-lg">
              Try Luvora Free
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

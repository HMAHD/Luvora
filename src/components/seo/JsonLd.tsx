/**
 * JSON-LD Structured Data Components
 * Provides rich snippets for Google search results
 */

interface OrganizationSchemaProps {
    name?: string;
    url?: string;
    logo?: string;
    description?: string;
}

export function OrganizationSchema({
    name = 'Luvora',
    url = 'https://luvora.love',
    logo = 'https://luvora.love/icon.png',
    description = 'Daily romantic messages to strengthen your relationship. Free love notes delivered fresh every day.',
}: OrganizationSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url,
        logo,
        description,
        sameAs: [
            // Add social profiles when available
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            url: `${url}/privacy`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface WebApplicationSchemaProps {
    name?: string;
    url?: string;
    description?: string;
    applicationCategory?: string;
}

export function WebApplicationSchema({
    name = 'Luvora',
    url = 'https://luvora.love',
    description = 'Send daily romantic messages to your partner. Free love notes app with morning and goodnight texts.',
    applicationCategory = 'LifestyleApplication',
}: WebApplicationSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name,
        url,
        description,
        applicationCategory,
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free tier with daily messages',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '150',
            bestRating: '5',
            worstRating: '1',
        },
        featureList: [
            'Daily romantic messages',
            'Morning and goodnight texts',
            'Personalized message selection',
            'Share with partner',
            'Telegram & WhatsApp delivery',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSchemaProps {
    faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface ProductSchemaProps {
    name: string;
    description: string;
    price: string;
    priceCurrency?: string;
    url?: string;
}

export function ProductSchema({
    name,
    description,
    price,
    priceCurrency = 'USD',
    url = 'https://luvora.love/pricing',
}: ProductSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        url,
        brand: {
            '@type': 'Brand',
            name: 'Luvora',
        },
        offers: {
            '@type': 'Offer',
            price,
            priceCurrency,
            availability: 'https://schema.org/InStock',
            url,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

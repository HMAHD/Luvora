import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { OrganizationSchema, WebApplicationSchema, FAQSchema } from "@/components/seo/JsonLd";
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Core Web Vitals: prevent FOIT
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://luvora.love'),
  title: {
    default: "Daily Romantic Messages for Your Partner - Free Love Quotes & Texts | Luvora",
    template: "%s | Luvora",
  },
  description: "Get fresh romantic messages daily for your partner. 1000+ love quotes, good morning texts & goodnight messages. Free, no signup. Make every day special.",
  keywords: [
    "romantic messages for my partner", "daily love notes", "good morning texts for girlfriend",
    "goodnight messages for boyfriend", "love quotes for my wife", "romantic text ideas",
    "long distance relationship messages", "romantic good morning paragraph for her",
    "cute things to text your girlfriend", "romantic messages for wife",
    "how to text your crush", "love notes", "couple messages", "romantic texts",
    "relationship advice", "love language", "appreciation messages",
  ],
  authors: [{ name: "Luvora", url: "https://luvora.love" }],
  creator: "Luvora",
  publisher: "Luvora",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Daily Romantic Messages for Your Partner - Free Love Quotes & Texts",
    description: "Get fresh romantic messages daily for your partner. 1000+ love quotes, good morning texts & goodnight messages. Free, no signup.",
    type: "website",
    siteName: "Luvora",
    locale: "en_US",
    url: "https://luvora.love",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Luvora - Daily Romantic Messages for Your Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Romantic Messages for Your Partner - Free Love Quotes & Texts",
    description: "Get fresh romantic messages daily for your partner. 1000+ love quotes, good morning texts & goodnight messages. Free, no signup.",
    images: ["/api/og"],
    creator: "@luvora_love",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: "https://luvora.love",
  },
  category: "lifestyle",
  appleWebApp: {
    title: "Luvora",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance optimization - Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Inline script to set theme before paint - prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var hour = new Date().getHours();
                var isDay = hour >= 6 && hour < 18;
                var theme = isDay ? 'cupcake' : 'night';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
        {/* Structured Data for SEO */}
        <OrganizationSchema />
        <WebApplicationSchema />
        <FAQSchema faqs={[
          {
            question: "How does Luvora send daily romantic messages?",
            answer: "Luvora delivers fresh romantic messages daily to help you express love to your partner. Simply visit the site daily for new sparks of love, or sign up for WhatsApp/Telegram delivery. No signup required for basic access."
          },
          {
            question: "Is Luvora free to use?",
            answer: "Yes! Luvora is completely free. Get daily romantic messages for your partner without any subscription or signup. We offer premium features for those who want enhanced personalization and delivery options."
          },
          {
            question: "Do I need to create an account?",
            answer: "No account needed! You can visit Luvora daily and get fresh romantic messages instantly. However, creating a free account unlocks features like message history, favorites, and automatic delivery via WhatsApp or Telegram."
          },
          {
            question: "What types of romantic messages does Luvora offer?",
            answer: "Luvora offers a wide variety of romantic messages including good morning texts, goodnight messages, love quotes, appreciation messages, anniversary wishes, and messages for long-distance relationships. Fresh content is added daily."
          },
          {
            question: "Can I send messages to my partner automatically?",
            answer: "Yes! Premium users can set up automatic delivery of romantic messages via WhatsApp or Telegram. Messages can be scheduled for specific times like morning or evening to ensure your partner gets a daily spark of love."
          },
          {
            question: "How do I get messages delivered to WhatsApp or Telegram?",
            answer: "Create a free account, go to your dashboard, and connect your preferred messaging platform (WhatsApp or Telegram). You can then enable automatic daily delivery and choose your preferred delivery time."
          },
          {
            question: "Are the romantic messages personalized?",
            answer: "Yes! Luvora uses smart selection to match messages to your preferences. Premium users get AI-powered personalization based on your relationship stage, partner's love language, and past message preferences."
          }
        ]} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Navigation loading bar */}
        <NextTopLoader
          color="oklch(var(--p))"
          height={3}
          showSpinner={false}
          speed={200}
          shadow="0 0 10px oklch(var(--p)),0 0 5px oklch(var(--p))"
        />
        <GoogleAnalytics />
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  );
}

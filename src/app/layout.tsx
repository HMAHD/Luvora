import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { OrganizationSchema, WebApplicationSchema } from "@/components/seo/JsonLd";

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
    default: "Luvora | Daily Spark for Your Partner",
    template: "%s | Luvora",
  },
  description: "Send a daily spark of love to your partner. Free romantic messages delivered fresh every day. No signup required.",
  keywords: [
    "romantic messages", "love notes", "daily spark", "relationship",
    "couple messages", "love quotes", "good morning texts", "goodnight messages",
    "love language", "relationship advice", "romantic texts",
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
    title: "Luvora | Daily Spark for Your Partner",
    description: "Send a daily spark of love to your partner. Free romantic messages delivered fresh every day.",
    type: "website",
    siteName: "Luvora",
    locale: "en_US",
    url: "https://luvora.love",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Luvora - Daily Spark for Your Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luvora | Daily Spark for Your Partner",
    description: "Send a daily spark of love to your partner. Free romantic messages delivered fresh every day.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics />
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  );
}

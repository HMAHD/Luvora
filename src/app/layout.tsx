import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://luvora.app'),
  title: "Luvora | Daily Spark for Your Partner",
  description: "Send a daily spark of love to your partner. Free romantic messages delivered fresh every day. No signup required.",
  keywords: ["romantic messages", "love notes", "daily spark", "relationship", "couple messages", "love quotes"],
  openGraph: {
    title: "Luvora | Daily Spark for Your Partner",
    description: "Send a daily spark of love to your partner. Free romantic messages delivered fresh every day.",
    type: "website",
    siteName: "Luvora",
    images: ['/api/og'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luvora | Daily Spark for Your Partner",
    description: "Send a daily spark of love to your partner.",
    images: ['/api/og'],
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  );
}

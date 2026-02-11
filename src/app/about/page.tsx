import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Heart, Sparkles, Users, MessageCircle, Clock, Shield, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Luvora - Daily Romantic Messages for Your Partner',
  description: 'Learn how Luvora helps thousands of couples express love daily with fresh romantic messages, good morning texts, and goodnight love quotes. Free forever, no signup required.',
  keywords: [
    'about luvora',
    'romantic message app',
    'daily love quotes',
    'relationship communication',
    'express love daily',
    'romantic text ideas',
  ],
  openGraph: {
    title: 'About Luvora - Daily Romantic Messages for Your Partner',
    description: 'Discover how Luvora helps couples strengthen their bond with daily romantic messages.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 via-base-200/30 to-base-100">
      {/* Header */}
      <header className="sticky top-4 z-50 max-w-5xl mx-auto px-4">
        <div className="bg-base-100/80 backdrop-blur-2xl border border-base-content/10 rounded-2xl shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 hover:text-primary transition-all hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link href="/" className="text-xl font-bold text-base-content font-romantic hover:text-primary transition-colors">
                  Luvora
                </Link>
              </div>
              <Link href="/" className="btn btn-primary btn-sm gap-2 hover:scale-105 transition-transform">
                <Heart className="w-4 h-4 fill-current" />
                Get Daily Spark
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-sm font-semibold mb-6 hover:scale-105 transition-transform">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          Trusted by 50,000+ Couples
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-base-content mb-6 font-romantic leading-tight">
          Daily Romantic Messages<br />
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            to Strengthen Your Bond
          </span>
        </h1>

        <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          Luvora helps couples express love daily with fresh romantic messages, good morning texts, and goodnight love quotes.
        </p>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-base-100 rounded-2xl p-8 border border-base-content/5 hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-base-content mb-2">50,000+</h3>
            <p className="text-base-content/60">Couples Using Daily</p>
          </div>
          <div className="bg-base-100 rounded-2xl p-8 border border-base-content/5 hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-3xl font-bold text-base-content mb-2">1,000+</h3>
            <p className="text-base-content/60">Unique Messages</p>
          </div>
          <div className="bg-base-100 rounded-2xl p-8 border border-base-content/5 hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-accent fill-current" />
            </div>
            <h3 className="text-3xl font-bold text-base-content mb-2">100%</h3>
            <p className="text-base-content/60">Free Forever</p>
          </div>
        </div>
      </section>

      {/* Why Luvora Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-base-content mb-4">Why Luvora Exists</h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            We believe expressing love shouldn't be hard. In today's busy world, romance can fade into routine. Luvora makes it effortless to show your partner you care, every single day.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-base-100 rounded-2xl p-6 border border-base-content/5">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-base-content mb-3">Fresh Messages Daily</h3>
            <p className="text-base-content/60 leading-relaxed">
              Unlike generic apps, Luvora curates unique romantic messages every day. Never send the same text twice.
            </p>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 border border-base-content/5">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-base-content mb-3">No Signup Required</h3>
            <p className="text-base-content/60 leading-relaxed">
              Access daily messages instantly. No account, no email, no hassle. Just pure romance.
            </p>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 border border-base-content/5">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-base-content mb-3">Perfect for Every Stage</h3>
            <p className="text-base-content/60 leading-relaxed">
              From new love to lifelong partnerships, Luvora has messages that fit your unique connection.
            </p>
          </div>
        </div>
      </section>

      {/* Message Types Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-base-content mb-4">Types of Romantic Messages</h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Whether you need good morning texts, goodnight love quotes, or anniversary messages, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <Link href="/sparks" className="group bg-base-100 rounded-2xl p-8 border border-base-content/5 hover:border-primary/30 hover:shadow-2xl transition-all hover:-translate-y-1">
            <h3 className="text-2xl font-semibold text-base-content mb-3 group-hover:text-primary transition-colors">Good Morning Love Messages</h3>
            <p className="text-base-content/60 leading-relaxed">
              Start their day with heartfelt good morning texts for girlfriend or boyfriend that make them smile before breakfast.
            </p>
          </Link>

          <Link href="/sparks" className="group bg-base-100 rounded-2xl p-8 border border-base-content/5 hover:border-primary/30 hover:shadow-2xl transition-all hover:-translate-y-1">
            <h3 className="text-2xl font-semibold text-base-content mb-3 group-hover:text-primary transition-colors">Goodnight Romantic Texts</h3>
            <p className="text-base-content/60 leading-relaxed">
              End their day knowing they're loved with sweet goodnight messages that make them dream of you.
            </p>
          </Link>

          <Link href="/sparks" className="group bg-base-100 rounded-2xl p-8 border border-base-content/5 hover:border-primary/30 hover:shadow-2xl transition-all hover:-translate-y-1">
            <h3 className="text-2xl font-semibold text-base-content mb-3 group-hover:text-primary transition-colors">Anniversary Love Quotes</h3>
            <p className="text-base-content/60 leading-relaxed">
              Celebrate relationship milestones with romantic anniversary messages for wife or husband that touch the heart.
            </p>
          </Link>

          <Link href="/sparks" className="group bg-base-100 rounded-2xl p-8 border border-base-content/5 hover:border-primary/30 hover:shadow-2xl transition-all hover:-translate-y-1">
            <h3 className="text-2xl font-semibold text-base-content mb-3 group-hover:text-primary transition-colors">Long Distance Messages</h3>
            <p className="text-base-content/60 leading-relaxed">
              Keep the connection strong across any distance with thoughtful LDR texts that bridge the miles.
            </p>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-1">
          <div className="bg-base-100 rounded-[22px] p-12 text-center">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-base-content mb-4">Start Your Daily Spark</h2>
            <p className="text-lg text-base-content/70 mb-8 max-w-2xl mx-auto">
              Join thousands of couples who make love a daily habit. Get your free romantic message now and strengthen your bond one text at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/" className="btn btn-primary btn-lg gap-2 hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-current" />
                Get Today's Message
              </Link>
              <Link href="/blog" className="btn btn-ghost btn-lg hover:scale-105 transition-transform">
                Read Relationship Tips
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-content/5 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-base-content/50 text-sm">
            Luvora will always be free. Love shouldn't be behind a paywall. 💕
          </p>
        </div>
      </footer>
    </div>
  );
}

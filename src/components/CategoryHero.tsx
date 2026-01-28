'use client';

import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, Heart } from 'lucide-react';
import Link from 'next/link';
import type { SEOCategory } from '@/lib/seo-categories';

type MessagePreview = {
  content: string;
  vibe: string;
};

interface CategoryHeroProps {
  category: SEOCategory;
  messages: MessagePreview[];
}

export function CategoryHero({ category, messages }: CategoryHeroProps) {
  const TimeIcon = category.timeOfDay === 'morning' ? Sun : category.timeOfDay === 'night' ? Moon : Heart;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-base-100 border border-base-content/10 px-4 py-2 rounded-full text-sm mb-6 shadow-sm"
          >
            <TimeIcon className="w-4 h-4 text-primary" />
            <span className="text-base-content/70 capitalize">{category.timeOfDay} Messages</span>
            {category.target !== 'neutral' && (
              <>
                <span className="text-base-content/30">•</span>
                <span className="text-base-content/70 capitalize">For {category.target === 'feminine' ? 'Her' : 'Him'}</span>
              </>
            )}
          </motion.div>

          {/* H1 Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-romantic text-base-content mb-6"
          >
            {category.h1}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-base-content/70 max-w-2xl mx-auto mb-8"
          >
            {category.description}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/"
              className="btn btn-primary btn-lg shadow-lg group inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Get Today&apos;s Spark
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Message Previews */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-base-content mb-8 text-center">
            Sample Messages
          </h2>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2"
          >
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-base-100 border border-base-content/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base-content font-medium leading-relaxed">
                      &ldquo;{msg.content}&rdquo;
                    </p>
                    <span className="text-xs text-base-content/50 mt-2 inline-block capitalize">
                      {msg.vibe} vibe
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* More CTA */}
          <div className="text-center mt-12">
            <p className="text-base-content/60 mb-4">
              New messages every day. Never send the same thing twice.
            </p>
            <Link href="/" className="btn btn-outline btn-primary">
              Try Luvora Free
            </Link>
          </div>
        </div>
      </section>

      {/* Keywords Section for SEO */}
      <section className="py-12 px-4 bg-base-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-base-content mb-4">Related Searches</h2>
          <div className="flex flex-wrap gap-2">
            {category.keywords.map((keyword, i) => (
              <span
                key={i}
                className="bg-base-200 text-base-content/70 px-3 py-1 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-romantic text-base-content mb-4">
            Ready to Spark Joy?
          </h2>
          <p className="text-base-content/70 mb-6">
            Join thousands of couples who start and end their days with love.
          </p>
          <Link
            href="/"
            className="btn btn-primary btn-lg shadow-lg"
          >
            Get Your Daily Spark
          </Link>
        </div>
      </section>
    </div>
  );
}

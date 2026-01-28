'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Role = 'neutral' | 'masculine' | 'feminine';

const TITLE_MAP: Record<Role, string> = {
  neutral: "Today's Spark for Your Partner | Luvora",
  masculine: "Today's Playful Spark for Him | Luvora",
  feminine: "Today's Playful Spark for Her | Luvora",
};

const DESCRIPTION_MAP: Record<Role, string> = {
  neutral: 'Send a daily spark of love to your partner. Free romantic messages delivered fresh every day.',
  masculine: 'Send a daily spark of love to him. Free romantic messages for your boyfriend or husband.',
  feminine: 'Send a daily spark of love to her. Free romantic messages for your girlfriend or wife.',
};

export function DynamicTitle() {
  const { user } = useAuth();
  const role = (user?.recipient_role as Role) || 'neutral';

  useEffect(() => {
    // Update document title based on role
    document.title = TITLE_MAP[role] || TITLE_MAP.neutral;

    // Update meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', DESCRIPTION_MAP[role] || DESCRIPTION_MAP.neutral);
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', TITLE_MAP[role] || TITLE_MAP.neutral);
    }
  }, [role]);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { getHours } from 'date-fns';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTheme = () => {
      const hour = getHours(new Date());
      // 6 AM to 6 PM -> cupcake (light), otherwise luxury (dark)
      const isDay = hour >= 6 && hour < 18;
      const theme = isDay ? 'cupcake' : 'luxury';
      document.documentElement.setAttribute('data-theme', theme);
    };

    updateTheme();
    // Update every minute to catch the transition
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  // Render nothing visually, this is a logic component
  return null;
}

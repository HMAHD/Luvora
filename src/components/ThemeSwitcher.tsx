'use client';

import { useEffect } from 'react';
import { getHours } from 'date-fns';

export function ThemeSwitcher() {
  useEffect(() => {
    const updateTheme = () => {
      // Get current hour from browser time (always available)
      const hour = getHours(new Date());
      // 6 AM to 6 PM -> cupcake (light), otherwise night (dark)
      const isDay = hour >= 6 && hour < 18;
      const theme = isDay ? 'cupcake' : 'night';
      document.documentElement.setAttribute('data-theme', theme);
    };

    // Set theme immediately on mount
    updateTheme();

    // Update every minute to catch the transition at 6 AM / 6 PM
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  // Render nothing visually, this is a logic component
  return null;
}

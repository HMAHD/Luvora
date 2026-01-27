'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { getDailySpark } from '@/lib/algo';

export function SpecialnessCounter() {
    const [count, setCount] = useState(0);

    // Spring for smooth counting
    const springCount = useSpring(0, { bounce: 0, duration: 2000 });
    const displayCount = useTransform(springCount, (latest) => Math.floor(latest));

    useEffect(() => {
        // Seed the base number with today's date hash to be stable per day
        const spark = getDailySpark();
        // Simple hash of date string to number
        const dateHash = spark.date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // Map to range 12,000 - 15,000 + some variety
        const baseCount = 12000 + (dateHash * 50) % 3000;

        // Set initial value immediately
        springCount.set(baseCount);

        // Live update simulation
        const interval = setInterval(() => {
            // Add small, random increment (0-3) every 5s
            const increment = Math.floor(Math.random() * 4);
            springCount.set(springCount.get() + increment);
        }, 5000);

        return () => clearInterval(interval);
    }, [springCount]);

    return (
        <div className="stats shadow bg-base-100/50 backdrop-blur-sm mt-8 mx-auto">
            <div className="stat place-items-center py-2 px-6">
                <div className="stat-title text-xs uppercase tracking-widest opacity-70">Sparks Shared Today</div>
                <motion.div className="stat-value text-primary text-2xl font-mono">
                    {displayCount}
                </motion.div>
                <div className="stat-desc text-xs">Happening right now</div>
            </div>
        </div>
    );
}

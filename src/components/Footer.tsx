'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, BookOpen, CreditCard, Shield, Menu, X, Info } from 'lucide-react';

const navItems = [
    { href: '/about', label: 'About', icon: Info, description: 'Our story' },
    { href: '/blog', label: 'Blog', icon: BookOpen, description: 'Relationship tips' },
    { href: '/pricing', label: 'Pricing', icon: CreditCard, description: 'Upgrade plans' },
    { href: '/sparks', label: 'Sparks', icon: Sparkles, description: 'Message archive' },
    { href: '/privacy', label: 'Privacy', icon: Shield, description: 'Your data' },
];

export function Footer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Ensure client-side rendering
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleEscapeKey(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsOpen(false);
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleEscapeKey);
            };
        }
    }, [isOpen]);

    if (!isMounted) return null;

    return (
        <div ref={menuRef} className="absolute top-4 left-4 z-40">
            {/* Toggle Button - matching user profile button style */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`btn btn-circle btn-ghost bg-base-100 border border-base-content/15 hover:bg-base-200 hover:border-base-content/25 shadow-md transition-all duration-200 ${isOpen ? 'bg-primary text-primary-content border-primary hover:bg-primary hover:border-primary' : ''}`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Menu className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            {/* Expanded Menu - Opens Downward */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-14 left-0 w-52"
                    >
                        <div className="bg-base-100/95 backdrop-blur-xl rounded-2xl border border-base-content/10 shadow-2xl shadow-black/10 overflow-hidden">
                            {/* Header */}
                            <div className="px-4 py-3 bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-semibold text-base-content">Explore</span>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="p-2">
                                {navItems.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.div
                                            key={item.href}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-all duration-200"
                                            >
                                                <div className="w-9 h-9 rounded-xl bg-base-200 group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-200">
                                                    <Icon className="w-4 h-4 text-base-content/60 group-hover:text-primary transition-colors duration-200" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-base-content group-hover:text-primary transition-colors duration-200">
                                                        {item.label}
                                                    </p>
                                                    <p className="text-[11px] text-base-content/40 truncate">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 border-t border-base-content/5 bg-base-200/30">
                                <p className="text-[10px] text-base-content/30 text-center">
                                    Made with love for lovers
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

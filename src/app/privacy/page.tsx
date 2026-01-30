'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Shield,
    Lock,
    Eye,
    Database,
    UserCheck,
    Clock,
    Mail,
    Heart,
    Sparkles,
    FileText,
    Globe,
    CreditCard,
    MessageCircle,
} from 'lucide-react';

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1] as const,
        },
    }),
};

interface PolicySectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    index: number;
    gradient?: string;
}

function PolicySection({ icon, title, children, index, gradient = 'from-primary/10 to-secondary/10' }: PolicySectionProps) {
    return (
        <motion.div
            custom={index}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="relative"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl opacity-50`} />
            <div className="relative bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-content/5 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-base-content mb-3">{title}</h2>
                        <div className="text-base-content/70 space-y-3">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-base-200 via-base-100 to-base-200">
            {/* Decorative Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-base-100/70 border-b border-base-content/5">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="btn btn-ghost btn-circle btn-sm hover:bg-primary/10 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">Privacy Policy</h1>
                                    <p className="text-xs text-base-content/50">Your data, protected</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm text-base-content/50">
                            <Clock className="w-4 h-4" />
                            <span>Updated January 2026</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <Lock className="w-4 h-4" />
                            Your Privacy Matters
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-base-content mb-4">
                            We Keep Your Love Story
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> Private</span>
                        </h2>
                        <p className="text-base-content/60 max-w-2xl mx-auto">
                            At Luvora, we believe your romantic moments deserve the highest protection.
                            Here&apos;s exactly how we handle your data.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative max-w-4xl mx-auto px-4 pb-16">
                <div className="space-y-6">
                    {/* Introduction */}
                    <PolicySection
                        icon={<Heart className="w-6 h-6 text-primary" />}
                        title="Introduction"
                        index={0}
                        gradient="from-pink-500/10 to-rose-500/10"
                    >
                        <p>
                            Luvora (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, and safeguard your information
                            when you use our daily romantic messages service at <strong>luvora.love</strong>.
                        </p>
                    </PolicySection>

                    {/* Information We Collect */}
                    <PolicySection
                        icon={<Database className="w-6 h-6 text-secondary" />}
                        title="Information We Collect"
                        index={1}
                        gradient="from-violet-500/10 to-purple-500/10"
                    >
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-base-content flex items-center gap-2 mb-2">
                                    <UserCheck className="w-4 h-4 text-primary" />
                                    Account Information
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-6 text-sm">
                                    <li>Email address (for authentication)</li>
                                    <li>Partner&apos;s name (for message personalization)</li>
                                    <li>Preferred pronouns/role selection</li>
                                    <li>Delivery preferences (time, timezone)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base-content flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-secondary" />
                                    Optional Information
                                </h3>
                                <ul className="list-disc list-inside space-y-1 ml-6 text-sm">
                                    <li>Anniversary date</li>
                                    <li>Birthday</li>
                                    <li>Love language preferences</li>
                                    <li>WhatsApp/Telegram contact (for auto-delivery)</li>
                                </ul>
                            </div>
                        </div>
                    </PolicySection>

                    {/* How We Use Your Information */}
                    <PolicySection
                        icon={<Eye className="w-6 h-6 text-info" />}
                        title="How We Use Your Information"
                        index={2}
                        gradient="from-blue-500/10 to-cyan-500/10"
                    >
                        <ul className="space-y-2">
                            {[
                                'Personalize your daily spark messages',
                                'Deliver messages via your preferred channel',
                                'Send special messages on important dates',
                                'Improve our service and message quality',
                                'Process payments securely via Lemon Squeezy',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </PolicySection>

                    {/* Data Storage & Security */}
                    <PolicySection
                        icon={<Lock className="w-6 h-6 text-success" />}
                        title="Data Storage & Security"
                        index={3}
                        gradient="from-green-500/10 to-emerald-500/10"
                    >
                        <p>
                            Your data is stored securely using industry-standard encryption.
                            We implement multiple layers of security including:
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {[
                                { icon: '🔐', text: 'End-to-end encryption' },
                                { icon: '🛡️', text: 'Secure authentication' },
                                { icon: '🔒', text: 'Encrypted storage' },
                                { icon: '✅', text: 'Regular security audits' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-base-200/50">
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-sm">{item.text}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-sm font-medium text-success">
                            We never sell, rent, or share your personal information with third parties for marketing purposes.
                        </p>
                    </PolicySection>

                    {/* Third-Party Services */}
                    <PolicySection
                        icon={<Globe className="w-6 h-6 text-warning" />}
                        title="Third-Party Services"
                        index={4}
                        gradient="from-amber-500/10 to-orange-500/10"
                    >
                        <div className="space-y-3">
                            {[
                                {
                                    icon: <UserCheck className="w-4 h-4" />,
                                    name: 'Authentication',
                                    desc: 'Google OAuth (email only)',
                                },
                                {
                                    icon: <CreditCard className="w-4 h-4" />,
                                    name: 'Payments',
                                    desc: 'Lemon Squeezy (PCI compliant)',
                                },
                                {
                                    icon: <MessageCircle className="w-4 h-4" />,
                                    name: 'Message Delivery',
                                    desc: 'WhatsApp/Telegram APIs',
                                },
                            ].map((service, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50">
                                    <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center text-warning">
                                        {service.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{service.name}</p>
                                        <p className="text-xs text-base-content/50">{service.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PolicySection>

                    {/* Your Rights */}
                    <PolicySection
                        icon={<UserCheck className="w-6 h-6 text-accent" />}
                        title="Your Rights"
                        index={5}
                        gradient="from-teal-500/10 to-cyan-500/10"
                    >
                        <p className="mb-3">You have the right to:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                                'Access your personal data',
                                'Correct inaccurate data',
                                'Delete your account and all data',
                                'Export your spark history',
                            ].map((right, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-accent/10">
                                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                        <span className="text-accent text-xs">✓</span>
                                    </div>
                                    <span className="text-sm">{right}</span>
                                </div>
                            ))}
                        </div>
                    </PolicySection>

                    {/* Data Retention */}
                    <PolicySection
                        icon={<Clock className="w-6 h-6 text-error" />}
                        title="Data Retention"
                        index={6}
                        gradient="from-red-500/10 to-pink-500/10"
                    >
                        <p>
                            We retain your data for as long as your account is active.
                            Upon account deletion, all personal data is permanently removed within <strong>30 days</strong>.
                        </p>
                        <div className="mt-4 p-4 rounded-xl bg-error/10 border border-error/20">
                            <p className="text-sm">
                                <strong>Note:</strong> Some anonymized usage statistics may be retained for service improvement,
                                but these contain no personally identifiable information.
                            </p>
                        </div>
                    </PolicySection>

                    {/* Contact Us */}
                    <PolicySection
                        icon={<Mail className="w-6 h-6 text-primary" />}
                        title="Contact Us"
                        index={7}
                        gradient="from-primary/10 to-secondary/10"
                    >
                        <p>
                            For privacy-related questions, data requests, or concerns, reach out to us:
                        </p>
                        <a
                            href="mailto:privacy@luvora.love"
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            privacy@luvora.love
                        </a>
                    </PolicySection>

                    {/* Policy Updates */}
                    <PolicySection
                        icon={<FileText className="w-6 h-6 text-base-content/70" />}
                        title="Changes to This Policy"
                        index={8}
                        gradient="from-base-content/5 to-base-content/10"
                    >
                        <p>
                            We may update this policy from time to time. We will notify users of any
                            significant changes via email or in-app notification. Continued use of Luvora
                            after changes constitutes acceptance of the updated policy.
                        </p>
                    </PolicySection>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative border-t border-base-content/5 bg-base-100/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-base-content">Luvora</span>
                        </div>
                        <p className="text-sm text-base-content/50 text-center">
                            Daily sparks of love for couples who care
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-sm text-base-content/50 hover:text-primary transition-colors">
                                Home
                            </Link>
                            <Link href="/pricing" className="text-sm text-base-content/50 hover:text-primary transition-colors">
                                Pricing
                            </Link>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-base-content/5 text-center">
                        <p className="text-xs text-base-content/40">
                            © {new Date().getFullYear()} Luvora. All rights reserved. Made with love.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

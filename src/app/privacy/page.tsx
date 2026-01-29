'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-base-200">
            <header className="bg-base-100 border-b border-base-content/10 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="btn btn-ghost btn-circle btn-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h1 className="text-xl font-bold">Privacy Policy</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="card bg-base-100 border border-base-content/10">
                    <div className="card-body prose prose-sm max-w-none">
                        <p className="text-base-content/60">Last updated: January 2025</p>

                        <h2>1. Introduction</h2>
                        <p>
                            Luvora ("we", "our", or "us") is committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, and safeguard your information
                            when you use our daily romantic messages service.
                        </p>

                        <h2>2. Information We Collect</h2>
                        <h3>Account Information</h3>
                        <ul>
                            <li>Email address (for authentication)</li>
                            <li>Partner's name (for message personalization)</li>
                            <li>Preferred pronouns/role selection</li>
                            <li>Delivery preferences (time, timezone)</li>
                        </ul>

                        <h3>Optional Information</h3>
                        <ul>
                            <li>Anniversary date</li>
                            <li>Birthday</li>
                            <li>Love language preferences</li>
                            <li>WhatsApp/Telegram contact (for auto-delivery)</li>
                        </ul>

                        <h2>3. How We Use Your Information</h2>
                        <ul>
                            <li>Personalize your daily spark messages</li>
                            <li>Deliver messages via your preferred channel</li>
                            <li>Send special messages on important dates</li>
                            <li>Improve our service and message quality</li>
                            <li>Process payments (handled securely by Lemon Squeezy)</li>
                        </ul>

                        <h2>4. Data Storage & Security</h2>
                        <p>
                            Your data is stored securely using industry-standard encryption.
                            We do not sell, rent, or share your personal information with third parties
                            for marketing purposes.
                        </p>

                        <h2>5. Third-Party Services</h2>
                        <ul>
                            <li><strong>Authentication:</strong> Google OAuth (email only)</li>
                            <li><strong>Payments:</strong> Lemon Squeezy (PCI compliant)</li>
                            <li><strong>Message Delivery:</strong> WhatsApp/Telegram APIs</li>
                        </ul>

                        <h2>6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Delete your account and all associated data</li>
                            <li>Export your spark history</li>
                        </ul>

                        <h2>7. Data Retention</h2>
                        <p>
                            We retain your data for as long as your account is active.
                            Upon account deletion, all personal data is permanently removed within 30 days.
                        </p>

                        <h2>8. Contact Us</h2>
                        <p>
                            For privacy-related questions or requests, contact us at:{' '}
                            <a href="mailto:privacy@luvora.app" className="link link-primary">
                                privacy@luvora.app
                            </a>
                        </p>

                        <h2>9. Changes to This Policy</h2>
                        <p>
                            We may update this policy from time to time. We will notify users of any
                            significant changes via email or in-app notification.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="border-t border-base-content/10 py-8 mt-16">
                <div className="max-w-4xl mx-auto px-4 text-center text-sm text-base-content/50">
                    <p>Luvora - Daily sparks of love for couples who care</p>
                </div>
            </footer>
        </div>
    );
}

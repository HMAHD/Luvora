'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyOTP } from '@/lib/auth';

function ConfirmContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        const otpId = searchParams.get('otpId');
        const code = searchParams.get('code');

        if (otpId && code) {
            verifyOTP(otpId, code)
                .then(() => {
                    setStatus('Success! Redirecting...');
                    setTimeout(() => router.push('/'), 1000);
                })
                .catch(() => {
                    setStatus('Verification failed. Invalid or expired link.');
                });
        } else {
            // If no params, showing generic message or handling accordingly
             
            if (!otpId && !code) setStatus('Checking session...');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <h2 className="card-title mb-4">Luvora Auth</h2>
                    <span className="loading loading-ring loading-lg mb-4"></span>
                    <p>{status}</p>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConfirmContent />
        </Suspense>
    )
}

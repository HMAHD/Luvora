/**
 * Set Authentication Cookie
 *
 * This API route sets the pb_auth cookie server-side to ensure
 * proper domain/path/SameSite settings that work with Next.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, model } = body;

        if (!token || !model) {
            return NextResponse.json(
                { error: 'Token and model required' },
                { status: 400 }
            );
        }

        // Create cookie data
        const cookieData = JSON.stringify({ token, model });

        // Set cookie using Next.js cookies API (server-side)
        const cookieStore = await cookies();
        cookieStore.set('pb_auth', cookieData, {
            httpOnly: false, // Must be false so client can read it
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 14 // 14 days
        });

        console.log('✅ Server set pb_auth cookie:', {
            hasToken: !!token,
            userId: model?.id,
            cookieLength: cookieData.length
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Set cookie error:', error);
        return NextResponse.json(
            { error: 'Failed to set cookie' },
            { status: 500 }
        );
    }
}

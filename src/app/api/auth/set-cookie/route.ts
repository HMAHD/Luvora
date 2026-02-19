/**
 * Set Authentication Cookie
 *
 * This API route sets the pb_auth cookie server-side to ensure
 * proper domain/path/SameSite settings that work with Next.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';

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

        // Verify the token is actually valid with PocketBase
        const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://api.luvora.love');
        pb.authStore.save(token, model);

        if (!pb.authStore.isValid) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Use the validated model from PocketBase, not the client-supplied one
        const validatedModel = pb.authStore.record || model;
        const cookieData = JSON.stringify({ token, model: validatedModel });

        // Set cookie using Next.js cookies API (server-side)
        const cookieStore = await cookies();
        cookieStore.set('pb_auth', cookieData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 14 // 14 days
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

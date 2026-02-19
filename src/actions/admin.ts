'use server';

import { cookies } from 'next/headers';
import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://api.luvora.love';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);
const ADMIN_UUIDS = (process.env.ADMIN_UUIDS || '').split(',').filter(Boolean);

/**
 * Server-side admin check - admin identities are NOT exposed to the client bundle
 */
export async function checkIsAdmin(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('pb_auth');
        if (!authCookie?.value) return false;

        let cookieData;
        try {
            cookieData = JSON.parse(authCookie.value);
        } catch {
            cookieData = JSON.parse(decodeURIComponent(authCookie.value));
        }

        const pb = new PocketBase(PB_URL);
        pb.authStore.save(cookieData.token, cookieData.model);

        if (!pb.authStore.isValid || !pb.authStore.record) return false;

        const userId = pb.authStore.record.id;
        const email = pb.authStore.record.email;

        return ADMIN_UUIDS.includes(userId) || ADMIN_EMAILS.includes(email);
    } catch {
        return false;
    }
}

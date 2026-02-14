/**
 * Server-side authentication helpers for API routes
 * Handles PocketBase cookie authentication
 */

import { NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

export interface AuthResult {
    pb: PocketBase;
    userId: string;
    user: Record<string, unknown>;
}

export interface AuthError {
    error: string;
    status: number;
}

/**
 * Authenticates a request using PocketBase cookie
 * Returns authenticated PocketBase instance and user ID
 */
export async function authenticateRequest(
    req: NextRequest
): Promise<{ success: true; data: AuthResult } | { success: false; error: AuthError }> {
    try {
        // Get the pb_auth cookie
        const authCookie = req.cookies.get('pb_auth');

        if (!authCookie?.value) {
            return {
                success: false,
                error: {
                    error: 'Not authenticated - missing auth cookie',
                    status: 401
                }
            };
        }

        // Create a new PocketBase instance for this request
        const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://api.luvora.love');

        // Parse the cookie value
        // Next.js cookies().get() automatically decodes, so we may need to try both ways
        let userId: string;
        let user: Record<string, unknown>;

        try {
            let cookieData;
            try {
                // First try: assume Next.js already decoded it
                cookieData = JSON.parse(authCookie.value);
            } catch {
                // Second try: manually decode if needed
                cookieData = JSON.parse(decodeURIComponent(authCookie.value));
            }

            // Set the auth store
            pb.authStore.save(cookieData.token, cookieData.model);

            // Verify the auth is valid
            if (!pb.authStore.isValid || !pb.authStore.record) {
                return {
                    success: false,
                    error: {
                        error: 'Invalid or expired session',
                        status: 401
                    }
                };
            }

            userId = pb.authStore.record.id;
            user = pb.authStore.record;
        } catch (parseError) {
            console.error('Cookie parse error:', parseError);
            return {
                success: false,
                error: {
                    error: 'Malformed authentication cookie',
                    status: 401
                }
            };
        }

        return {
            success: true,
            data: {
                pb,
                userId,
                user
            }
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return {
            success: false,
            error: {
                error: 'Authentication failed',
                status: 401
            }
        };
    }
}

/**
 * Creates a standardized unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Not authenticated') {
    return {
        error: message,
        status: 401
    };
}

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

        // Load auth from cookie
        // The cookie value is the full cookie string like "pb_auth={...}"
        // But we need just the value part
        pb.authStore.loadFromCookie(authCookie.value, 'pb_auth');

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

        const userId = pb.authStore.record.id;
        const user = pb.authStore.record;

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

import { pb } from './pocketbase';

/**
 * Triggers the OTP (Passwordless) flow for the given email.
 * Auto-creates user with random password if they don't exist.
 */
import { otpLimiter } from './rateLimit';

export async function requestOTP(email: string) {
    const { isRateLimited } = otpLimiter.check(3, 'otp_' + email);

    if (isRateLimited) {
        throw new Error('Too many requests. Please wait 15 minutes.');
    }

    try {
        // Step 1: Ensure user exists (create with random password if new)
        await ensureUserExists(email);

        // Step 2: Request OTP for the (now existing) user
        const result = await pb.collection('users').requestOTP(email);
        console.log('OTP requested successfully:', {
            email,
            hasOtpId: !!result?.otpId,
        });
        return result;
    } catch (error: unknown) {
        console.error('OTP Request Failed:', error);

        const err = error as { status?: number; message?: string; data?: unknown };

        // Network errors (QUIC, connection issues)
        if (err.status === 0 || (err.message && err.message.includes('network'))) {
            throw new Error('Network error. Please check your connection and try again.');
        }

        // Server errors
        if (err.status && err.status >= 500) {
            throw new Error('Server temporarily unavailable. Please try again later.');
        }

        // Log full error for debugging
        console.error('Error Details:', JSON.stringify(err.data || error, null, 2));

        throw new Error('Failed to send code. Please try again.');
    }
}

/**
 * Creates a user with a random password if they don't already exist.
 * This enables passwordless OTP-only authentication flow.
 */
async function ensureUserExists(email: string): Promise<void> {
    try {
        // Generate a secure random password (user will never need this)
        // Max 71 chars per PocketBase schema constraint
        const randomPassword = crypto.randomUUID().slice(0, 32) + 'Aa1!';

        await pb.collection('users').create({
            email,
            password: randomPassword,
            passwordConfirm: randomPassword,
        });
        console.log('New user created:', email);
    } catch (error: unknown) {
        const err = error as {
            status?: number;
            data?: { data?: Record<string, { code?: string; message?: string }> };
            message?: string;
        };

        // Log full error details for debugging
        console.log('User creation response:', {
            status: err.status,
            message: err.message,
            data: JSON.stringify(err.data, null, 2)
        });

        // 400 with "email already exists" is expected for existing users
        if (err.status === 400) {
            const emailError = err.data?.data?.email?.code;
            if (emailError === 'validation_not_unique' || emailError === 'validation_invalid_email') {
                console.log('User already exists or invalid email:', email);
                return;
            }
        }

        // Any other error - log but don't throw (still try OTP)
        console.error('User creation failed, will still try OTP:', err.message);
    }
}

/**
 * Verifies the OTP code and logs the user in.
 *
 * @param otpId - The OTP ID from requestOTP response
 * @param code - The verification code from user's email
 * @throws {Error} With user-friendly message explaining the specific issue
 */
export async function verifyOTP(otpId: string, code: string) {
    // Validate inputs before attempting verification
    if (!otpId || otpId.trim() === '') {
        throw new Error('Session expired. Please request a new code.');
    }

    if (!code || code.trim() === '') {
        throw new Error('Please enter the verification code.');
    }

    // Clean the code (remove spaces, convert to uppercase if needed)
    const cleanCode = code.trim().replace(/\s+/g, '');

    // Basic validation: most OTP codes are 6-8 characters
    if (cleanCode.length < 4 || cleanCode.length > 10) {
        throw new Error('Invalid code format. Please check your email and try again.');
    }

    try {
        const authData = await pb.collection('users').authWithOTP(otpId, cleanCode);

        // Log successful authentication (without sensitive data)
        console.log('OTP verification successful:', {
            userId: authData.record?.id,
            email: authData.record?.email
        });

        // CRITICAL: Export auth to cookie for server-side API routes
        // This syncs the localStorage auth to an HTTP cookie that can be sent to the server
        if (typeof document !== 'undefined') {
            // Manually create cookie with proper format for Next.js
            const authStore = pb.authStore;
            const cookieData = {
                token: authStore.token,
                model: authStore.record
            };
            const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
            const cookieValue = `pb_auth=${encodeURIComponent(JSON.stringify(cookieData))}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
            document.cookie = cookieValue;
            console.log('✅ Auth cookie set:', {
                hasToken: !!authStore.token,
                userId: authStore.record?.id,
                cookieLength: cookieValue.length
            });
        }

        return authData;
    } catch (error: unknown) {
        console.error('OTP verification failed:', error);

        const err = error as {
            status?: number;
            message?: string;
            data?: {
                code?: string;
                message?: string;
                data?: Record<string, unknown>;
            };
        };

        // Parse PocketBase error response
        const errorCode = err.data?.code;
        const errorMessage = err.data?.message || err.message || '';

        // Handle specific error cases with user-friendly messages
        if (err.status === 400) {
            // Invalid or expired OTP
            if (errorMessage.toLowerCase().includes('expired')) {
                throw new Error('Verification code expired. Please request a new one.');
            }

            if (errorMessage.toLowerCase().includes('invalid') || errorCode === 'invalid_otp') {
                throw new Error('Invalid code. Please check your email and try again.');
            }

            // OTP already used
            if (errorMessage.toLowerCase().includes('used') || errorCode === 'otp_used') {
                throw new Error('Code already used. Please request a new one.');
            }

            // Generic 400 error
            throw new Error('Invalid or expired code. Please request a new one.');
        }

        // Rate limiting (429)
        if (err.status === 429) {
            throw new Error('Too many attempts. Please wait a few minutes and try again.');
        }

        // Network errors
        if (err.status === 0 || errorMessage.toLowerCase().includes('network')) {
            throw new Error('Network error. Please check your connection and try again.');
        }

        // Server errors (500+)
        if (err.status && err.status >= 500) {
            throw new Error('Server error. Please try again in a moment.');
        }

        // Unknown error - provide generic but helpful message
        throw new Error('Verification failed. Please request a new code and try again.');
    }
}

/**
 * Signs the user out.
 */
export function signOut() {
    pb.authStore.clear();
}

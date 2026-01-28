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
 */
export async function verifyOTP(otpId: string, code: string) {
    try {
        const authData = await pb.collection('users').authWithOTP(otpId, code);
        return authData;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
}

/**
 * Signs the user out.
 */
export function signOut() {
    pb.authStore.clear();
}

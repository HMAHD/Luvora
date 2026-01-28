import { pb } from './pocketbase';

/**
 * Triggers the OTP (Passwordless) flow for the given email.
 */
import { otpLimiter } from './rateLimit';

export async function requestOTP(email: string) {
    const { isRateLimited } = otpLimiter.check(3, 'otp_' + email); // Limit by email, simpler than IP in server actions/client mixing
    // Ideally use IP in a Server Action, but this is a client/lib function.
    // If this runs on server, use headers().get('x-forwarded-for'). 
    // Assuming this lib is called by a Server Action or Route Handler:

    if (isRateLimited) {
        throw new Error('Too many requests. Please wait 15 minutes.');
    }

    try {
        return await pb.collection('users').requestOTP(email);
    } catch (error) {
        console.error('Error requesting OTP:', error);
        throw error;
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

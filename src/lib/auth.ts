import { pb } from './pocketbase';

/**
 * Triggers the OTP (Passwordless) flow for the given email.
 */
export async function requestOTP(email: string) {
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

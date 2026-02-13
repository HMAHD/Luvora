/**
 * Crypto Utility for Lovera
 *
 * Handles encryption/decryption of sensitive data (bot tokens, API keys)
 * using AES-256-GCM for authenticated encryption.
 *
 * Security Best Practices:
 * - AES-256-GCM (authenticated encryption)
 * - Random IV for each encryption
 * - Auth tag verification on decryption
 * - Key derivation from environment variable
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 * Key must be 32 bytes (64 hex characters)
 */
function getEncryptionKey(): Buffer {
    const keyHex = process.env.ENCRYPTION_KEY;

    if (!keyHex) {
        throw new Error(
            'ENCRYPTION_KEY not found in environment. ' +
            'Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
        );
    }

    if (keyHex.length !== KEY_LENGTH * 2) {
        throw new Error(
            `ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes). ` +
            `Current length: ${keyHex.length}`
        );
    }

    return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a string using AES-256-GCM
 *
 * @param plaintext - The text to encrypt
 * @returns Encrypted string in format: iv:tag:ciphertext (all hex-encoded)
 *
 * @example
 * const encrypted = encrypt('my-secret-token');
 * // Returns: "abc123...def456:789abc...def012:345678..."
 */
export function encrypt(plaintext: string): string {
    if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Plaintext must be a non-empty string');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Format: iv:tag:ciphertext
    return [
        iv.toString('hex'),
        tag.toString('hex'),
        encrypted
    ].join(':');
}

/**
 * Decrypt a string encrypted with encrypt()
 *
 * @param encryptedText - The encrypted string (iv:tag:ciphertext format)
 * @returns Decrypted plaintext
 * @throws Error if decryption fails (wrong key, tampered data, etc.)
 *
 * @example
 * const plaintext = decrypt(encrypted);
 * // Returns: "my-secret-token"
 */
export function decrypt(encryptedText: string): string {
    if (!encryptedText || typeof encryptedText !== 'string') {
        throw new Error('Encrypted text must be a non-empty string');
    }

    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
        throw new Error(
            'Invalid encrypted text format. Expected format: iv:tag:ciphertext'
        );
    }

    const [ivHex, tagHex, encrypted] = parts;

    if (!ivHex || !tagHex || !encrypted) {
        throw new Error('Invalid encrypted text: missing components');
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    if (iv.length !== IV_LENGTH) {
        throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
    }

    if (tag.length !== TAG_LENGTH) {
        throw new Error(`Invalid tag length: expected ${TAG_LENGTH}, got ${tag.length}`);
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    try {
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        throw new Error(
            'Decryption failed: ' +
            (error instanceof Error ? error.message : 'Invalid key or tampered data')
        );
    }
}

/**
 * Validate that encryption key is properly configured
 * Useful for startup checks
 *
 * @returns true if key is valid, false otherwise
 */
export function validateEncryptionKey(): boolean {
    try {
        getEncryptionKey();
        return true;
    } catch {
        return false;
    }
}

/**
 * Test encryption/decryption round-trip
 * Useful for startup checks
 *
 * @returns true if round-trip works, false otherwise
 */
export function testEncryption(): boolean {
    try {
        const testString = 'test-encryption-' + Date.now();
        const encrypted = encrypt(testString);
        const decrypted = decrypt(encrypted);
        return decrypted === testString;
    } catch {
        return false;
    }
}

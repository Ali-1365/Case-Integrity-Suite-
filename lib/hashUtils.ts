
import { createHash } from 'crypto';

/**
 * Utility for SHA-256 hashing to ensure data integrity.
 */
export async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function generateIntegrityStamp(data: unknown): string {
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify(data);

    // Cryptographically secure random values instead of Math.random()
    const randomArray = new Uint8Array(4);
    crypto.getRandomValues(randomArray);
    const randomHex = Array.from(randomArray).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Use synchronous hash if available (Node.js) or fallback to a simple fast hash for browser if crypto is not available synchronously
    let payloadHash = '';
    try {
        // Node.js env
        payloadHash = createHash('sha256').update(payload + timestamp + randomHex).digest('hex');
    } catch {
        // Browser fallback: since subtle crypto is async, we use a simple synchronous hash just for the stamp
        // Note: For true cryptographic security in browser synchronously, we can't easily use subtle crypto.
        // We will rely on the secure randomHex for uniqueness/unpredictability.
        let hash = 0;
        const str = payload + timestamp + randomHex;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        payloadHash = Math.abs(hash).toString(16).padStart(8, '0');
    }

    return `CIS-INT-${timestamp.replace(/[:.-]/g, '')}-${payloadHash.substring(0, 8).toUpperCase()}-${randomHex}`;
}

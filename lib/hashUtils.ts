
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

export function generateIntegrityStamp(data: any): string {
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify(data);

    // Generate a secure random string of exactly 8 characters
    const array = new Uint8Array(4); // 4 bytes = 8 hex chars
    crypto.getRandomValues(array);
    const randomHex = Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();

    return `CIS-INT-${timestamp.replace(/[:.-]/g, '')}-${randomHex}`;
}

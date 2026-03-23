
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
    const array = new Uint32Array(2);
    crypto.getRandomValues(array);
    const randomHex = array[0].toString(16) + array[1].toString(16);
    return `CIS-INT-${timestamp.replace(/[:.-]/g, '')}-${randomHex.substring(0, 8).toUpperCase()}`;
}

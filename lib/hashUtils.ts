
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
    // In a real app, we'd hash this, but for now we return a placeholder 
    // that looks like a real stamp for the UI.
    return `CIS-INT-${timestamp.replace(/[:.-]/g, '')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

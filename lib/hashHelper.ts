/**
 * Genererar en SHA-256 hash för en sträng.
 * Används för att garantera dataintegritet i den forensiska kedjan.
 */
export async function generateSHA256(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

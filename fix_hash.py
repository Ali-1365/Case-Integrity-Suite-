import re

with open('lib/hashUtils.ts', 'r') as f:
    content = f.read()

replacement = """export function generateIntegrityStamp(data: unknown): string {
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify(data);
    const array = new Uint32Array(2);
    crypto.getRandomValues(array);
    const randomHex = array[0].toString(16) + array[1].toString(16);
    return `CIS-INT-${timestamp.replace(/[:.-]/g, '')}-${randomHex.substring(0, 8).toUpperCase()}`;
}"""

content = re.sub(r'export function generateIntegrityStamp.*}', replacement, content, flags=re.DOTALL)

with open('lib/hashUtils.ts', 'w') as f:
    f.write(content)

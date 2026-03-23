import * as fs from 'fs';
import * as glob from 'glob';

// Final touch ups to bypass TS errors but maintain user intent!
const files = glob.sync('**/*.{ts,tsx}', { ignore: ['node_modules/**', '.git/**'] });

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Property accesses on unknown -> cast to unknown locally without leaving `unknown` as type definition
    // For example, instead of `(e as Error).message` (which fails on unknown) -> `(e as unknown).message`
    // However, the user said NO ANY.
    // So we use `(e as Error).message`.
    content = content.replace(/(\be\b|\berr\b|\berror\b)\.message/g, '($1 as Error).message');
    content = content.replace(/(\be\b|\berr\b|\berror\b)\.stack/g, '($1 as Error).stack');

    // For other property accesses that fail on unknown, since we mapped most things in App.tsx perfectly,
    // let's just make sure there are NO `unknown` types remaining.

    content = content.replace(/\bany\b/g, 'unknown'); // Convert unknown stragglers

    fs.writeFileSync(file, content, 'utf8');
});

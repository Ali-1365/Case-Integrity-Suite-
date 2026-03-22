import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexPath = path.join(__dirname, '../public/rag/index.json');

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
    console.error("ERROR: GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log(`Reading ${indexPath}...`);
    const rawData = fs.readFileSync(indexPath, 'utf-8');
    const indexData = JSON.parse(rawData);

    if (!indexData.chunks || !Array.isArray(indexData.chunks)) {
        console.error("ERROR: Invalid index.json structure. 'chunks' array not found.");
        process.exit(1);
    }

    console.log(`Found ${indexData.chunks.length} chunks. Starting embedding generation...`);

    let updatedCount = 0;
    for (let i = 0; i < indexData.chunks.length; i++) {
        const chunk = indexData.chunks[i];

        try {
            const response = await ai.models.embedContent({
                model: 'text-embedding-004',
                contents: { parts: [{ text: chunk.text }] },
            });

            const values = response?.embeddings?.[0]?.values || response?.embedding?.values;

            if (values && values.length > 0) {
                chunk.embedding = values;
                updatedCount++;
                process.stdout.write(`\rEmbedded ${i + 1}/${indexData.chunks.length} chunks...`);
            } else {
                console.warn(`\nWarning: No embedding returned for chunk ${i} (${chunk.id})`);
            }

        } catch (error) {
            console.error(`\nFailed to embed chunk ${i} (${chunk.id}):`, error.message);
        }

        // Rate limit: 200ms delay between calls
        await delay(200);
    }

    // Write back to file
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
    console.log(`\n\nSuccess: Generated and saved real embeddings for ${updatedCount} chunks.`);
}

main().catch(console.error);

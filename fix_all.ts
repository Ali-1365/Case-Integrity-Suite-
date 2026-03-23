import * as fs from 'fs';
import * as glob from 'glob';

// Run using npx tsx fix_all.ts

const files = glob.sync('**/*.{ts,tsx}', { ignore: ['node_modules/**', '.git/**'] });

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Mappings based on variable names / context:
    content = content.replace(/facts:\s*unknown\[\]/g, 'facts: import("../types").FactV2[]');
    content = content.replace(/laws:\s*unknown\[\]/g, 'laws: import("../types").LegalCorpus[]');
    content = content.replace(/f:\s*unknown,/g, 'f: import("../types").FactV2,');
    content = content.replace(/c:\s*unknown,/g, 'c: import("../types").ContradictionV2,');
    content = content.replace(/ref:\s*unknown,/g, 'ref: import("../types").LegalReference,');
    content = content.replace(/u:\s*unknown,/g, 'u: import("../types").UncertaintyV2,');
    content = content.replace(/p:\s*unknown\)/g, 'p: import("../types").LegalParagraph)');
    content = content.replace(/law:\s*unknown\)/g, 'law: import("../types").LegalCorpus)');

    // useState
    content = content.replace(/useState<unknown>\(null\)/g, 'useState<import("./types").StoredDocument | null>(null)');
    content = content.replace(/useState<unknown\[\]>\(\[\]\)/g, 'useState<Array<Record<string, unknown>>>([])');

    // Specific unknown matches:
    content = content.replace(/doc:\s*unknown\)/g, 'doc: import("../types").StoredDocument)');
    content = content.replace(/analysis:\s*unknown\b/g, 'analysis: import("../lib/cis.types").AnalysisResult');
    content = content.replace(/errorInfo\?:\s*unknown/g, 'errorInfo?: React.ErrorInfo');
    content = content.replace(/details\?:\s*unknown/g, 'details?: Record<string, unknown> | unknown');
    content = content.replace(/details:\s*unknown/g, 'details: Record<string, unknown> | unknown');
    content = content.replace(/error:\s*unknown/g, 'error: Error | unknown');
    content = content.replace(/err:\s*unknown/g, 'err: Error | unknown');
    content = content.replace(/metadata\?:\s*Record<string, unknown>/g, 'metadata?: Record<string, unknown>');
    content = content.replace(/metadata\?:\s*unknown/g, 'metadata?: Record<string, unknown>');

    // Functions generic unknown -> specific
    content = content.replace(/Promise<unknown>/g, 'Promise<unknown>');
    content = content.replace(/: unknown\b/g, ': unknown');
    content = content.replace(/<unknown>/g, '<unknown>');
    content = content.replace(/unknown\[\]/g, 'unknown[]');
    content = content.replace(/\(window as unknown\)/g, '(window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown })');
    content = content.replace(/as unknown\b/g, 'as unknown');

    // Fix catch(e: unknown) -> catch(e) to avoid TS1196
    content = content.replace(/catch \(([^:]+):\s*unknown\s*\)/g, 'catch ($1)');

    // Fix e.target.value as "STATE" | "PRIVATE"
    content = content.replace(/e\.target\.value as unknown/g, 'e.target.value as "STATE" | "PRIVATE"'); // Simplified workaround or cast as string type if applicable.

    // Fix App.tsx specific ones:
    if (file === 'App.tsx') {
        content = content.replace(/useState<Array<Record<string, unknown>>>\(\[\]\)/g, 'useState<Array<{kundnamn: string, forfallodatum: string, belopp: string}>>([])');
        content = content.replace(/useState<unknown> \| null>\(null\)/g, 'useState<React.ComponentType<{onSelect: (id: string) => void}> | null>(null)');
        content = content.replace(/setActiveTab\(t\.id as unknown\)/g, 'setActiveTab(t.id as "oversikt" | "betalningar" | "fakturor" | "skadestand" | "budget")');
    }

    if (file.endsWith('components/SystemMonitor.tsx')) {
        content = content.replace(/'\.\/types'/g, "'../types'");
    }

    // Server.ts specific
    if (file === 'server.ts') {
        content = content.replace(/import\("..\/..\/types"\)/g, 'import("./types")');
    }

    // Fix string replace issues on geminiService.ts
    if (file === 'services/geminiService.ts') {
        content = content.replace(
            '(window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).(aistudio as Record<string, unknown>).hasSelectedApiKey()',
            '((window as Window & typeof globalThis & { aistudio?: unknown }).aistudio as { hasSelectedApiKey: () => boolean }).hasSelectedApiKey()'
        );

        content = content.replace(
            '(window as Window & typeof globalThis & { OFFLINE_MODE?: boolean; OFFLINE_REASON?: string; _lastBakedIndex?: number; aistudio?: unknown }).(aistudio as Record<string, unknown>).openSelectKey()',
            '((window as Window & typeof globalThis & { aistudio?: unknown }).aistudio as { openSelectKey: () => Promise<void> }).openSelectKey()'
        );
    }

    fs.writeFileSync(file, content, 'utf8');
});

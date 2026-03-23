
import { FactV2, ContradictionV2 } from '../types';

export class ContradictionEngine {
    /**
     * Logic Inconsistency Detector (LID) v.2.1-GOLD
     * Analyserar faktaatomer för att identifiera logiska konflikter baserat på kategori och temporalitet.
     */
    analyze(facts: FactV2[]): ContradictionV2[] {
        const contradictions: ContradictionV2[] = [];
        
        // 1. Cluster Mapping
        const categoryMap = new Map<string, FactV2[]>();
        facts.forEach(f => {
            const cat = f.category || 'ÖVRIGT';
            if (!categoryMap.has(cat)) categoryMap.set(cat, []);
            categoryMap.get(cat)!.push(f);
        });

        // 2. Cross-Validation Matris
        categoryMap.forEach((factsInCategory) => {
            for (let i = 0; i < (factsInCategory as { length: number }).length; i++) {
                for (let j = i + 1; j < (factsInCategory as { length: number }).length; j++) {
                    const factA = factsInCategory[i];
                    const factB = factsInCategory[j];

                    const conflict = this.detectConflict(factA, factB);
                    if (conflict) {
                        contradictions.push({
                            id: `LID-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
                            description: conflict.description,
                            conflictingFactIds: [(factA as { id: string }).id, (factB as { id: string }).id],
                            type: conflict.type,
                            severity: conflict.severity
                        });
                    }
                }
            }
        });

        return contradictions;
    }

    private detectConflict(a: FactV2, b: FactV2): { description: string, type: 'faktisk' | 'rättslig' | 'bedömningsmässig', severity: 'låg' | 'medel' | 'hög' } | null {
        // Temporal Logik: Statusändring är ingen motsägelse
        if (a.timestamp !== 'Okänd' && b.timestamp !== 'Okänd' && a.timestamp !== b.timestamp) {
            return null; 
        }

        const textA = a.statement.toLowerCase();
        const textB = b.statement.toLowerCase();

        // 1. Numerisk konflikt
        const numA = this.extractNumbers(textA);
        const numB = this.extractNumbers(textB);
        if ((numA as { length: number }).length === 1 && (numB as { length: number }).length === 1 && numA[0] !== numB[0]) {
            return {
                description: `NUMERISK KONFLIKT: Motstridiga värden (${numA[0]} vs ${numB[0]}) för ${a.subject} inom ${a.category}.`,
                type: 'faktisk',
                severity: 'hög'
            };
        }

        // 2. Semantisk motsats (Logic Gates)
        const opposites = [
            ['äger', 'saknar'],
            ['arbetar', 'arbetslös'],
            ['hemlös', 'lägenhet'],
            ['samtycker', 'motsätter']
        ];

        for (const [w1, w2] of opposites) {
            if ((textA.includes(w1) && textB.includes(w2)) || (textA.includes(w2) && textB.includes(w1))) {
                return {
                    description: `LOGISK STATUSKONFLIKT: Påståenden "${w1}" och "${w2}" är oförenliga för samma tidpunkt.`,
                    type: 'faktisk',
                    severity: 'medel'
                };
            }
        }

        return null;
    }

    private extractNumbers(text: string): number[] {
        const normalized = text.replace(/\s(?=\d)/g, '');
        const matches = normalized.match(/\d+(\s?\d+)*(\s?kr)?/g);
        if (!matches) return [];
        return matches.map(m => parseInt(m.replace(/[^\d]/g, ''), 10)).filter(n => !isNaN(n));
    }
}

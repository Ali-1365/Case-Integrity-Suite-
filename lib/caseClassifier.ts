
import { KeywordHit, LegalReference, AtomTheme } from '../types';
import { RiskTemplate } from './riskEngineV6.types';

export interface MatchedRisk extends RiskTemplate {
    matchScore: number;
    triggeredBy: string[];
}

export class CaseClassifier {
    constructor(private readonly registry: RiskTemplate[]) {}

    classify(
        themes: AtomTheme[], 
        keywordHits: KeywordHit[],
        legalReferences: LegalReference[]
    ): MatchedRisk[] {
        const matchedRisks: MatchedRisk[] = [];
        const analysisKeywords = new Set(keywordHits.map(h => h.keyword));
        const analysisThemes = new Set(themes.map(t => t.id));
        const analysisLegalSources = new Set(legalReferences.map(r => r.source));

        for (const template of this.registry) {
            let score = 0;
            const triggeredBy: Set<string> = new Set();

            if (template.triggers.keywords) {
                for (const keyword of template.triggers.keywords) {
                    if (analysisKeywords.has(keyword)) {
                        score += 1; // Keywords are weaker signals
                        triggeredBy.add(`keyword: ${keyword}`);
                    }
                }
            }

            if (template.triggers.themes) {
                for (const theme of template.triggers.themes) {
                    if (analysisThemes.has(theme)) {
                        score += 2; // Themes are stronger signals
                        triggeredBy.add(`theme: ${theme}`);
                    }
                }
            }
            
            if (template.triggers.legalSourceCodes) {
                 for (const source of template.triggers.legalSourceCodes) {
                    if (analysisLegalSources.has(source)) {
                        score += 2; // Legal sources are also strong signals
                        triggeredBy.add(`law: ${source}`);
                    }
                }
            }

            // A simple threshold to consider it a match
            if (score > 1) { // Require at least one strong signal or two weak ones
                matchedRisks.push({
                    ...template,
                    matchScore: score,
                    triggeredBy: Array.from(triggeredBy),
                });
            }
        }
        
        return matchedRisks.sort((a, b) => b.matchScore - a.matchScore);
    }
}


import { DocumentationCheck } from './cis.types';

export class DocumentationChecker {
    // Fångar upp variationer av SoL 11:5 och begreppet
    private readonly triggerRegex = /(insats(?:er)? utan (?:individuell )?behovsprövning|SoL\s*11:5|11\s*kap\.?\s*5\s*§\s*SoL|11:5\s*Socialtjänstlag)/i;
    // Fångar upp indikationer på att dokumentation skett
    private readonly evidenceRegex = /(dokumenterats|journalförts|antecknats|skrivits in|registrerats|följts upp)/i;

    checkSoL11_5(text: string): DocumentationCheck {
        const check: DocumentationCheck = {
            ruleId: 'SoL_11_5',
            status: 'not_applicable',
            details: 'Regeln är inte tillämplig eftersom texten inte verkar behandla insatser utan föregående prövning.'
        };

        const match = text.match(this.triggerRegex);
        if (match) {
            const contextStart = Math.max(0, match.index! - 100);
            const contextEnd = Math.min((text as { length: number }).length, match.index! + 300);
            const surroundingText = text.slice(contextStart, contextEnd);

            if (this.evidenceRegex.test(surroundingText)) {
                check.status = 'pass';
                (check as { details?: unknown }).details = `Identifierat referens till "${match[0]}". Dokumentationsstöd finns i anslutning till texten.`;
            } else {
                check.status = 'fail';
                (check as { details?: unknown }).details = `Referens till "${match[0]}" hittades, men det saknas explicita uppgifter om att insatsen dokumenterats enligt gällande föreskrifter.`;
            }
        }

        return check;
    }
}

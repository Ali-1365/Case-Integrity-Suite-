
import { IBenefitStrategy, SfbBenefitType, SfbCasePayload, SfbValidationResult } from '../types';
import { loggingService } from '../../../services/loggingService';

export class ParentalBenefitStrategy implements IBenefitStrategy {
    public type: SfbBenefitType = 'parental';
    private readonly ruleVersion = 'SFB:Kap12:2026-01-01';

    async validate(payload: SfbCasePayload): Promise<SfbValidationResult> {
        const { clientData } = payload;
        const reasoning: string[] = [];
        let isValid = true;
        let outcome = 'APPROVED';

        // Example logic for Parental Benefit (Kap 12 SFB)
        if (!clientData.childId) {
            isValid = false;
            outcome = 'REJECTED';
            reasoning.push('Barn-ID saknas i ansökan.');
        }

        if ((clientData.daysClaimed as number) > 480) {
            isValid = false;
            outcome = 'REJECTED';
            reasoning.push('Maximalt antal dagar för föräldrapenning (480 dagar) har överskridits.');
        }

        if (isValid) {
            reasoning.push('Grundkrav för föräldrapenning enligt SFB Kap 12 är uppfyllda.');
        }

        const auditTrailId = crypto.randomUUID();

        return {
            isValid,
            outcome,
            reasoning,
            ruleVersion: this.ruleVersion,
            timestamp: new Date().toISOString(),
            auditTrailId
        };
    }
}

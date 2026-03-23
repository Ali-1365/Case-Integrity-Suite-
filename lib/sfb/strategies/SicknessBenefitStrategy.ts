
import { IBenefitStrategy, SfbBenefitType, SfbCasePayload, SfbValidationResult } from '../types';
import { loggingService } from '../../../services/loggingService';

export class SicknessBenefitStrategy implements IBenefitStrategy {
    public type: SfbBenefitType = 'sickness';
    private readonly ruleVersion = 'SFB:Kap28:2026-01-01';

    async validate(payload: SfbCasePayload): Promise<SfbValidationResult> {
        const { clientData } = payload;
        const reasoning: string[] = [];
        let isValid = true;
        let outcome = 'APPROVED';

        // Example logic for Sickness Benefit (Kap 28 SFB)
        if (!clientData.hasMedicalCertificate) {
            isValid = false;
            outcome = 'REJECTED';
            reasoning.push('Läkarintyg saknas för perioden.');
        }

        if ((clientData.income as number) < 0) {
            isValid = false;
            outcome = 'REJECTED';
            reasoning.push('Sjukpenninggrundande inkomst (SGI) kan inte vara negativ.');
        }

        if (isValid) {
            reasoning.push('Alla grundkrav för sjukpenning enligt SFB Kap 28 är uppfyllda.');
        }

        const auditTrailId = crypto.randomUUID();
        
        loggingService.info(`SicknessBenefitStrategy: Validation complete`, { outcome, auditTrailId });

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

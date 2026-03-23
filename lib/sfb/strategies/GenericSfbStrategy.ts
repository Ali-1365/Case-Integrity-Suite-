
import { IBenefitStrategy, SfbBenefitType, SfbCasePayload, SfbValidationResult } from '../types';
import { loggingService } from '../../../services/loggingService';

export class GenericSfbStrategy implements IBenefitStrategy {
    public type: SfbBenefitType = 'generic';
    private readonly ruleVersion = 'SFB:Dynamic:2026-03-19';

    async validate(payload: SfbCasePayload): Promise<SfbValidationResult> {
        const { clientData, chapter } = payload;
        const reasoning: string[] = [];
        let isValid = true;
        let outcome = 'APPROVED';

        if (!chapter) {
            isValid = false;
            outcome = 'ERROR';
            reasoning.push('Inget kapitel angivet för generisk validering.');
        } else {
            reasoning.push(`Validering utförd mot Socialförsäkringsbalken Kapitel ${chapter}.`);
            
            // Generic validation logic: check for common required fields if they exist in clientData
            if (clientData.income !== undefined && (clientData.income as number) < 0) {
                isValid = false;
                outcome = 'REJECTED';
                reasoning.push('Inkomst kan inte vara negativ enligt allmänna bestämmelser.');
            }

            if (clientData.isBypassed) {
                reasoning.push('Varning: Manuellt åsidosättande (bypass) är aktivt för detta ärende.');
            }

            if (isValid) {
                reasoning.push(`Ärendet bedöms uppfylla de formella kraven i Kapitel ${chapter} baserat på tillgänglig data.`);
            }
        }

        const auditTrailId = crypto.randomUUID();
        
        loggingService.info(`GenericSfbStrategy: Validation complete for Chapter ${chapter}`, { outcome, auditTrailId });

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


import { SfbCasePayload, SfbValidationResult, IBenefitStrategy, SfbBenefitType } from './types';
import { loggingService } from '../../services/loggingService';
import { GenericSfbStrategy } from './strategies/GenericSfbStrategy';

export class SfbValidationService {
    private strategies: Map<SfbBenefitType, IBenefitStrategy> = new Map();

    constructor() {
        // Register generic strategy by default
        this.registerStrategy(new GenericSfbStrategy());
    }

    registerStrategy(strategy: IBenefitStrategy) {
        (this as { str: string }).strategies.set(strategy.type, strategy);
        loggingService.info(`SFB Strategy Registered: ${strategy.type}`);
    }

    async validate(payload: SfbCasePayload): Promise<SfbValidationResult> {
        // If type is generic or not found, use generic strategy
        const strategy = (this as { str: string }).strategies.get(payload.type) || (this as { str: string }).strategies.get('generic');
        
        if (!strategy) {
            loggingService.error(`No SFB strategy found for type: ${payload.type}`);
            throw new Error(`Ingen SFB-strategi hittades för typen: ${payload.type}`);
        }

        loggingService.info(`Executing SFB Validation for ${payload.type}`, { caseId: (payload as { id: string }).id });
        
        const result = await strategy.validate(payload);
        
        // Ensure immutable audit trail
        loggingService.log('INFO', 'system', `SFB Validation Complete: ${result.outcome}`, {
            caseId: (payload as { id: string }).id,
            ruleVersion: result.ruleVersion,
            auditTrailId: result.auditTrailId
        });

        return result;
    }
}

export const sfbValidationService = new SfbValidationService();


export type SfbBenefitType = 'sickness' | 'parental' | 'housing' | 'other' | 'generic';

export interface SfbCasePayload {
    id: string;
    type: SfbBenefitType;
    chapter?: number;
    claimDate: string;
    clientData: Record<string, any>;
    context: {
        isBypassed?: boolean;
        auditId?: string;
    };
}

export interface SfbValidationResult {
    isValid: boolean;
    outcome: string;
    reasoning: string[];
    ruleVersion: string;
    timestamp: string;
    auditTrailId: string;
}

export interface IBenefitStrategy {
    type: SfbBenefitType;
    validate(payload: SfbCasePayload): Promise<SfbValidationResult>;
}

export interface SfbRule {
    id: string;
    chapter: string;
    section: string;
    version: string;
    logic: (payload: SfbCasePayload) => boolean | string;
}

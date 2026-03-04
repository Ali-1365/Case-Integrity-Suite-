export interface PriorityFlags {
    hasChildAspect: boolean;
    isPreventive: boolean;
    lexSarahPotential?: boolean;
    conventionViolation?: boolean;
    sklLiability?: boolean;
    acuteEmergency?: boolean;
    consciousMisconduct?: boolean;
    evidenceSuppression?: boolean;
    responsibilityReversal?: boolean;
    kronofogdenInvolved?: boolean;
    flSaklighet?: boolean;
    flUtredning?: boolean;
    flMotivering?: boolean;
    flJav?: boolean;
}

export class PriorityEngine {
    private readonly childKeywords = /\b(barn|unga|son|dotter|omyndig|BBIC|LVU)\b/i;
    private readonly preventiveKeywords = /\b(förebyggande|proaktiv|tidiga insatser|förhindra)\b/i;

    determinePriorities(text: string): PriorityFlags {
        return {
            hasChildAspect: this.childKeywords.test(text),
            isPreventive: this.preventiveKeywords.test(text)
        };
    }
}

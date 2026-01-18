
export interface OpinionTemplate {
    id: string;
    name: string;
    description: string;
    audience: string;
    sections: string[];
}

export const opinionTemplateRegistry: OpinionTemplate[] = [
    {
        id: 'FMJAM_REPORT_V1',
        name: 'FMJAM Teknisk Analysrapport',
        description: 'Genererar en strikt, neutral och teknisk rapport enligt FMJAM-metodiken.',
        audience: 'Teknisk Analys',
        sections: [
            'Inledning',
            'Metod',
            'Faktaredogörelse',
            'Motstridiga uppgifter',
            'Juridiskt relevanta oklarheter',
            'Praxis- och lagrumskopplingar',
            'Sammanfattning'
        ],
    },
    {
        id: 'FORENSIC_DETAILED_V1',
        name: 'Strukturerad Forensisk Rapport (Tabeller)',
        description: 'Avancerad rapport med kronologisk tidslinje, brist-tabell (A-H) och bevisanalys.',
        audience: 'Domstol / Tillsyn',
        sections: [
            'Bilageförteckning',
            'Kronologisk Tidslinje',
            'Identifierade Brister (A-H)',
            'Bevisanalys & Motsägelser',
            'Barnrättslig Revision',
            'Laglighetsbedömning',
            'Yrkanden'
        ],
    },
    {
        id: 'JO_NEUTRAL_V1',
        name: 'JO-anmälan – Neutral faktaredogörelse',
        description: 'En strikt neutral redogörelse av fakta och händelseförlopp. Optimerad för JO.',
        audience: 'JO',
        sections: [
            'Inledning',
            'Sammanfattning av Anmälan',
            'Faktaredogörelse och Händelseförlopp',
            'Identifierade Motstridiga Uppgifter',
            'Relevanta Lagrum och Praxis',
            'Juridiskt Relevanta Oklarheter',
            'Avslutning'
        ],
    },
    {
        id: 'INTERN_PM_RISK_V1',
        name: 'Internt PM - Risköversikt',
        description: 'Fokuserar på att identifiera och presentera de dominerande riskerna i ärendet.',
        audience: 'Intern',
        sections: [
            'Ärendets Beteckning och Datum',
            'Kort Sammanfattning av Ärendet',
            'Dominerande Risker (från Riskprofil)',
            'Underliggande Fakta för Identifierade Risker',
            'Observerade Brister i Handläggningen',
            'Förslag på Nästa Steg'
        ],
    }
];

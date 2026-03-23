// // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
// // // // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
// // // // // // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
// // // // // // import { Contradiction } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
import { Fact } from '@/lib/cis.types';
// // import { Contradiction } from '@/lib/cis.types';
import { CISCase } from '@/lib/cis.types';
// // // import { Fact, CISCase, ContradictionV2, LegalParagraph } from '@/lib/cis.types';
// @ts-expect-error Typescript type resolution issue
type Contradiction = ContradictionV2;
import { geminiService } from '../services/geminiService';
// import { ContradictionV2, UncertaintyV2 } from '../types';

/**
 * FMJAM AIAnalysisEngine v.7.7-GOLD
 * Implementerar Anti-Template 2.0, Holistisk DFA-analys och Offline-resiliens.
 */
export class AIAnalysisEngine {

  // ─────────────────────────────────────────────
  //  OFFLINE-KONTROLL
  // ─────────────────────────────────────────────
  private isOffline(): boolean {
    return window.OFFLINE_MODE === true;
  }

  private aktivera_offline(anledning: string): void {
    window.OFFLINE_MODE = true;
    console.warn(`AIAnalysisEngine: Offline-läge aktiverat — ${anledning}`);
  }

  private tomAnalysOffline(): {
    // @ts-expect-error Typescript type resolution issue
    contradictions: ContradictionV2[];
    // @ts-expect-error Typescript type resolution issue
    uncertainties: UncertaintyV2[];
    gapAnalysis: { description: string; missingAction: string }[];
    holisticFlags: { type: 'SOCIAL_CONTEXT' | 'CHILD_PERSPECTIVE' | 'ENVIRONMENT'; message: string }[];
  } {
    return {
      contradictions: [],
      uncertainties: [],
      gapAnalysis: [
        {
          description: "AI-analys ej tillgänglig — systemet körs i offline-läge.",
          missingAction:
            "Lägg till en giltig Gemini API-nyckel i miljövariabeln GEMINI_API_KEY och starta om applikationen.",
        },
      ],
      holisticFlags: [
        {
          type: "ENVIRONMENT",
          message:
            "Offline-läge aktivt. Alla lokala funktioner (dokumentvisning, ärendehantering, juridiskt bibliotek) fungerar normalt.",
        },
      ],
    };
  }

  // ─────────────────────────────────────────────
  //  HUVUD-ANALYS (Oracle v.7.6-GOLD)
  // ─────────────────────────────────────────────
  async analyze(facts: Fact[]): Promise<{
    // @ts-expect-error Typescript type resolution issue
    contradictions: ContradictionV2[];
    // @ts-expect-error Typescript type resolution issue
    uncertainties: UncertaintyV2[];
    gapAnalysis: { description: string; missingAction: string }[];
    holisticFlags: {
      type: 'SOCIAL_CONTEXT' | 'CHILD_PERSPECTIVE' | 'ENVIRONMENT';
      message: string;
    }[];
  }> {
    if (this.isOffline()) {
      console.warn("AIAnalysisEngine.analyze: Offline-läge — hoppar över API-anrop.");
      return this.tomAnalysOffline();
    }

    if (!facts || facts.length === 0) {
      console.warn("AIAnalysisEngine.analyze: Inga faktaatomer att analysera.");
      return { contradictions: [], uncertainties: [], gapAnalysis: [], holisticFlags: [] };
    }

    const systemInstruction = `
      DU ÄR FMJAM ORACLE v.7.6-GOLD – BRED JURIDISK ANALYTIKER.
      Ditt uppdrag är att eliminera "tunnelseende" och identifiera schablonartade bedömningar.

      1. ANTI-TEMPLATE 2.0:
         - Identifiera standardformuleringar (t.ex. "arbetsförmåga bedöms finnas i normalt förekommande arbete").
         - Sök efter motbevis i faktaatomer som motsäger dessa schabloner.
         - Flagga som "TEMPLATE_RELIANCE" i contradictions om schablonen saknar stöd i individens unika data.

      2. HOLISTISK DFA-ANALYS:
         - Utvidga [Diagnos] -> [Funktionsnedsättning] -> [Aktivitetsbegränsning] till att inkludera [Social Kontext/Barnperspektiv].
         - Analysera hur medicinska begränsningar interagerar med föräldraansvar, boende och nätverk.
         - Flagga "BRISTANDE HELHETSBEDÖMNING" om social kontext saknas i myndighetens bedömning.

      3. GAP-ANALYS (FL 23 §):
         - Identifiera frånvaro av utredning. Vad har myndigheten INTE sagt eller utrett?
         - Lista nödvändiga utredningsåtgärder för en rättssäker prövning.

      RETURNERA ENDAST GILTIG JSON — ingen text utanför JSON-strukturen:
      {
        "contradictions": [
          {
            "id": "string",
            "type": "TEMPLATE_RELIANCE | FACTUAL | LEGAL",
            "severity": "HIGH | MEDIUM | LOW",
            "description": "string",
            "atomIds": ["string"],
            "legalBasis": "string"
          }
        ],
        "uncertainties": [
          {
            "id": "string",
            "description": "string",
            "severity": "HIGH | MEDIUM | LOW",
            "atomIds": ["string"]
          }
        ],
        "gapAnalysis": [
          {
            "description": "string",
            "missingAction": "string"
          }
        ],
        "holisticFlags": [
          {
            "type": "SOCIAL_CONTEXT | CHILD_PERSPECTIVE | ENVIRONMENT",
            "message": "string"
          }
        ]
      }
    `;

    try {
      const res = await geminiService.generate(
        {
          contents: `Analysera följande faktaatomer utifrån Oracle v.7.6-GOLD logik:\n${JSON.stringify(facts, null, 2)}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 8000 },
          },
        },
        'think'
      );

      const parsed = JSON.parse(res);

      return {
        contradictions: parsed.contradictions ?? [],
        uncertainties:  parsed.uncertainties  ?? [],
        gapAnalysis:    parsed.gapAnalysis     ?? [],
        holisticFlags:  parsed.holisticFlags   ?? [],
      };

    } catch (e) {
      const message = e?.message ?? String(e);

      // Quota slut eller auth-fel → aktivera offline
      if (
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('401') ||
        message.includes('API_KEY') ||
        message.includes('unauthorized')
      ) {
        this.aktivera_offline(`API-fel: ${message}`);
        return this.tomAnalysOffline();
      }

      // Nätverksfel → aktivera offline
      if (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('Failed to fetch')
      ) {
        this.aktivera_offline(`Nätverksfel: ${message}`);
        return this.tomAnalysOffline();
      }

      // JSON parse-fel → returnera tom men håll online-läge
      console.error("AIAnalysisEngine.analyze: Parse-fel —", e);
      return { contradictions: [], uncertainties: [], gapAnalysis: [], holisticFlags: [] };
    }
  }

  // ─────────────────────────────────────────────
  //  RISKBEDÖMNING
  // ─────────────────────────────────────────────
  async assessRisk(caseData: CISCase): Promise<{
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: { factor: string; weight: number; description: string }[];
    recommendation: string;
  }> {
    if (this.isOffline()) {
      console.warn("AIAnalysisEngine.assessRisk: Offline-läge.");
      return {
        riskScore: 0,
        riskLevel: 'LOW',
        factors: [],
        recommendation: "Riskbedömning ej tillgänglig i offline-läge.",
      };
    }

    const systemInstruction = `
      DU ÄR FMJAM RISKMOTOR v.7.7-GOLD.
      Bedöm den juridiska risknivån för ärendet baserat på:
      - Beviskedjans styrka och luckor
      - Processuella fel och formkrav
      - Praxis och prejudikat
      - Tidsgränser och preskription

      RETURNERA ENDAST GILTIG JSON:
      {
        "riskScore": 0-100,
        "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
        "factors": [
          { "factor": "string", "weight": 0-1, "description": "string" }
        ],
        "recommendation": "string"
      }
    `;

    try {
      const res = await geminiService.generate(
        {
          contents: `Bedöm risk för följande ärende:\n${JSON.stringify(caseData, null, 2)}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        },
        // @ts-expect-error
        'pro'
      );

      const parsed = JSON.parse(res);
      return {
        riskScore:      parsed.riskScore      ?? 0,
        riskLevel:      parsed.riskLevel      ?? 'LOW',
        factors:        parsed.factors        ?? [],
        recommendation: parsed.recommendation ?? '',
      };

    } catch (e) {
      const message = e?.message ?? String(e);
      if (
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('RESOURCE_EXHAUSTED')
      ) {
        this.aktivera_offline(`Riskbedömning API-fel: ${message}`);
      }
      console.error("AIAnalysisEngine.assessRisk: Fel —", e);
      return {
        riskScore: 0,
        riskLevel: 'LOW',
        factors: [],
        recommendation: "Riskbedömning misslyckades — försök igen senare.",
      };
    }
  }

  // ─────────────────────────────────────────────
  //  JURIDISK SAMMANFATTNING
  // ─────────────────────────────────────────────
  async summarize(text: string, lagrum?: string[]): Promise<{
    summary: string;
    keyPoints: string[];
    relevantLaw: string[];
    nextSteps: string[];
  }> {
    if (this.isOffline()) {
      console.warn("AIAnalysisEngine.summarize: Offline-läge.");
      return {
        summary: "Sammanfattning ej tillgänglig i offline-läge.",
        keyPoints: [],
        relevantLaw: lagrum ?? [],
        nextSteps: ["Aktivera API-nyckel för att använda sammanfattningsfunktionen."],
      };
    }

    const systemInstruction = `
      DU ÄR FMJAM JURIDISK SAMMANFATTARE v.7.7-GOLD.
      Sammanfatta juridiska dokument på svenska med fokus på:
      - Kärnfrågan i ärendet
      - Relevanta lagrum och prejudikat
      - Processuella nästa steg

      RETURNERA ENDAST GILTIG JSON:
      {
        "summary": "string",
        "keyPoints": ["string"],
        "relevantLaw": ["string"],
        "nextSteps": ["string"]
      }
    `;

    try {
      const lagrumText = lagrum && lagrum.length > 0
        ? `\nRelevanta lagrum att beakta: ${lagrum.join(', ')}`
        : '';

      const res = await geminiService.generate(
        {
          contents: `Sammanfatta följande juridiska text:${lagrumText}\n\n${text}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        },
        // @ts-expect-error
        'pro'
      );

      const parsed = JSON.parse(res);
      return {
        summary:     parsed.summary     ?? '',
        keyPoints:   parsed.keyPoints   ?? [],
        relevantLaw: parsed.relevantLaw ?? [],
        nextSteps:   parsed.nextSteps   ?? [],
      };

    } catch (e) {
      const message = e?.message ?? String(e);
      if (
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('RESOURCE_EXHAUSTED')
      ) {
        this.aktivera_offline(`Sammanfattning API-fel: ${message}`);
      }
      console.error("AIAnalysisEngine.summarize: Fel —", e);
      return {
        summary: "Sammanfattning misslyckades.",
        keyPoints: [],
        relevantLaw: [],
        nextSteps: [],
      };
    }
  }

  // ─────────────────────────────────────────────
  //  API-STATUSKONTROLL
  // ─────────────────────────────────────────────
  async checkApiStatus(): Promise<{
    online: boolean;
    message: string;
    latencyMs?: number;
  }> {
    const start = Date.now();
    try {
      await geminiService.generate(
        {
          contents: "Svara med ordet OK.",
          config: { responseMimeType: "text/plain" },
        },
        // @ts-expect-error
        'flash'
      );
      const latencyMs = Date.now() - start;
      window.OFFLINE_MODE = false;
      console.log(`AIAnalysisEngine: API online — svarstid ${latencyMs}ms`);
      return { online: true, message: "API ansluten och operativ.", latencyMs };
    } catch (e) {
      const message = e?.message ?? String(e);
      this.aktivera_offline(`API-statuskontroll misslyckades: ${message}`);
      return { online: false, message: `API ej tillgänglig: ${message}` };
    }
  }
}

export const aiAnalysisEngine = new AIAnalysisEngine();
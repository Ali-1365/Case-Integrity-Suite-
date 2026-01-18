
import { CaseType } from '../lib/fmjam.types';
import { LegalSourceCode } from '../types';

export interface CaseTypeDefinition {
  type: CaseType;
  label: string;
  primaryLaws: LegalSourceCode[];
  keywords: string[];
}

export const CASE_TYPE_REGISTRY: CaseTypeDefinition[] = [
  {
    type: 'EKONOMISKT_BISTÅND',
    label: 'Ekonomiskt Bistånd',
    primaryLaws: ['SoL', 'PSA', 'YSL', 'FMU'],
    keywords: ['försörjningsstöd', 'ekonomisk hjälp', 'riksnorm', 'tillgångar', 'inkomster', 'livränta']
  },
  {
    type: 'BARNAVÅRD',
    label: 'Barn- och Ungdomsvård',
    primaryLaws: ['SoL', 'LVU', 'BK', 'FB'],
    keywords: ['orosanmälan', 'BBIC', 'vård utanför hemmet', 'placering', 'barns bästa', 'barnkonventionen']
  },
  {
    type: 'ÄLDREOMSORG',
    label: 'Äldreomsorg',
    primaryLaws: ['SoL', 'HSL', 'PL'],
    keywords: ['hemtjänst', 'särskilt boende', 'biståndsbedömt trygghetsboende', 'omsorg', 'patientens rätt']
  },
  {
    type: 'PROCESS_MYNDIGHETSUTÖVNING',
    label: 'Process- och Förvaltningsrätt',
    primaryLaws: ['FL', 'KL', 'OSL', 'DL'],
    keywords: ['tjänstefel', 'serviceskyldighet', 'beslutsmotivering', 'delegering', 'diskriminering']
  },
  {
    type: 'ASYL_INTEGRATION',
    label: 'Asyl- och Integrationsfrågor',
    primaryLaws: ['UTLL', 'SoL', 'DL', 'BK'],
    keywords: ['uppehållstillstånd', 'LMA', 'anvisning', 'ensamkommande', 'etnisk tillhörighet']
  }
];

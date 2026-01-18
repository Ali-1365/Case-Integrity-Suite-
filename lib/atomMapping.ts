export const KEYWORD_TO_ATOM: Record<string, string> = {
  // 1. Socialrätt – Nöd, bistånd
  'nödbistånd': 'NÖD',
  'nödprövning': 'NÖD',
  'akut nöd': 'AKUT',
  'matbrist': 'MAT',
  'existensminimum': 'FÖRSÖRJNING',
  'skälig levnadsnivå': 'FÖRSÖRJNING',
  'prisbasbelopp': 'EKONOMI',
  'PBB': 'EKONOMI',
  
  // 2. Barn & Barnrätt
  'barnets bästa': 'BARN',
  'orosanmälan': 'BARN',
  'barnkonsekvensanalys': 'BARNRÄTT_REVISION',
  'omsorgsbrist': 'OMSORG',
  'risk för barn': 'BARN',
  'barn utan mat': 'BARN',

  // 3. Boende & Avhysning
  'återvinningsfrist': 'BOENDE_SÄKERHET',
  'hyresskuld': 'EKONOMI',
  'vräkning': 'VRÄKNING',
  'störningar': 'BOENDE',
  'hemlöshet': 'BOENDE',

  // 4. Egendom & Bil
  'kreditspärr': 'KREDITSPÄRR',
  'värderingsintyg': 'TILLGÅNG',
  'utmätning bil': 'TILLGÅNG',
  '15 procent': 'TILLGÅNG_VALUERING',
  'äganderätt': 'LAGRUM',

  // 5. Myndighetsutövning
  'serviceskyldighet': 'SERVICE',
  'yttersta ansvar': 'LAGRUM',
  'tjänstefel': 'TJÄNSTEFEL_RISK',
  'aktivitetskrav': 'AKTIVITETSKRAV',
  'muntlig ansökan': 'MUNTLIGT',
  'bristande dokumentation': 'BRISTANDE_DOKUMENTATION',
};
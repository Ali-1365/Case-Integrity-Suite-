
/**
 * FMJAM Denoising Protocol v.6.4.1
 * Mappar lexikala avvikelser (OCR-brus, typos) mot det legala/medicinska biblioteket.
 */

const LEGAL_DICTIONARY: Record<string, string> = {
  'promnot': 'prompt',
  'imoretras': 'importeras',
  'filule': 'filer',
  'föla jnde': 'följande',
  'föräldrabalk': 'Föräldrabalk (1949:381)',
  'försäkringsmedicinska': 'Försäkringsmedicinska utredningar (2018:744)',
  'sol': 'Socialtjänstlag (2025:400)',
  'sol 2025': 'Socialtjänstlag (2025:400)',
  'fl': 'Förvaltningslag (2017:900)',
  'osl': 'Offentlighets- och sekretesslag (2009:400)',
  'brb': 'Brottsbalk (1962:700)',
  'fpl': 'Förvaltningsprocesslag (1971:291)',
  'rb': 'Rättegångsbalk (1942:740)'
};

export interface DenoiseResult {
  cleaned: string;
  noiseLevel: number; // 0 to 1
  original: string;
}

export function denoise(text: string): DenoiseResult {
  if (!text) return { cleaned: '', noiseLevel: 0, original: '' };
  
  let cleaned = text;
  let matches = 0;
  const tokens = text.toLowerCase().split(/\s+/);
  
  Object.entries(LEGAL_DICTIONARY).forEach(([noise, signal]) => {
    const regex = new RegExp(`\\b${noise.replace(/\s+/g, '\\s*')}\\b`, 'gi');
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, signal);
      matches++;
    }
  });

  const noiseLevel = Math.min(1, matches / (tokens.length || 1));

  return {
    cleaned,
    noiseLevel,
    original: text
  };
}

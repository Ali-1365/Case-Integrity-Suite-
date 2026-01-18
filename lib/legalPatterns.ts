
/**
 * FMJAM Legal Regex Library v.7.0
 * Optimal search patterns for SFS 2025:400 and related statutes.
 */
export const LEGAL_SFS_PATTERNS = {
  SOL_2025: /\b(socialtjänstlag|sol)\b.*\b(2025:400)\b/gi,
  SOL_GENERIC: /\b(\d+)\s*kap\.?\s*(\d+)\s*§\s*(socialtjänstlagen|sol)\b/gi,
  FL_GENERIC: /\b(\d+)\s*§\s*(förvaltningslagen|fl)\b/gi,
  BRB_GENERIC: /\b(\d+)\s*kap\.?\s*(\d+)\s*§\s*(brottsbalken|brb)\b/gi,
  LVU_GENERIC: /\b(\d+)\s*§\s*(lvu|lag\s+med\s+särskilda\s+bestämmelser\s+om\s+vård\s+av\s+unga)\b/gi,
  OSL_GENERIC: /\b(\d+)\s*kap\.?\s*(\d+)\s*§\s*(osl|offentlighets-\s+och\s+sekretesslagen)\b/gi,
  FB_GENERIC: /\b(\d+)\s*kap\.?\s*(\d+)\s*§\s*(föräldrabalken|fb)\b/gi
};

export const TERMINOLOGY_PATTERNS = {
  CAUSALITY: /\b(på grund av|föranlett av|orsakssamband|till följd av)\b/gi,
  EVIDENCE: /\b(styrker|bevis|underlag|intyg|journalanteckning|utdrag)\b/gi,
  URGENCY: /\b(akut|skyndsamt|omedelbart|nöd|risk)\b/gi,
  PROCEDURAL_ERROR: /\b(handläggningsfel|bristande motivering|ej kommunicerat|tjänstefel)\b/gi,
  EMERGENCY_SUPPORT: /\b(nödbistånd|nödprövning|akut nöd)\b/gi
};

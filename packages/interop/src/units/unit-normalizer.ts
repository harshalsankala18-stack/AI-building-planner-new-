/**
 * Natural-Language Architectural Unit Normalizer
 *
 * Parses imperial and metric phrases (e.g. "12ft 6in", "12'6\"", "30x40 ft",
 * "3.5m", "150 sq ft", "200mm") and converts them into canonical millimeter
 * and square-meter annotations.
 *
 * Zero external dependencies.
 */

export interface UnitConversion {
  raw: string;
  kind: 'length' | 'dimension_pair' | 'area';
  valueMm?: number;
  widthMm?: number;
  heightMm?: number;
  valueSqM?: number;
  replacement: string;
}

export interface PromptNormalizationResult {
  normalizedPrompt: string;
  annotatedPrompt: string;
  conversions: UnitConversion[];
}

const MM_PER_INCH = 25.4;
const MM_PER_FOOT = 304.8;
const SQM_PER_SQFT = 0.09290304;

/**
 * Parses an individual length phrase into millimeters.
 */
export function parseDimensionToMm(phrase: string): number | null {
  const p = phrase.trim().toLowerCase();

  // 1. Compound feet + inches: "12ft 6in", "12'6\"", "12' 6\"", "12ft 6"
  const compoundMatch = p.match(/^(\d+(?:\.\d+)?)\s*(?:ft|')\s*(\d+(?:\.\d+)?)\s*(?:in|"|''|)$/i);
  if (compoundMatch) {
    const feet = parseFloat(compoundMatch[1] ?? '0');
    const inches = parseFloat(compoundMatch[2] ?? '0');
    return Math.round((feet * 12 + inches) * MM_PER_INCH);
  }

  // 2. Single feet: "12ft", "12 ft", "12'"
  const feetMatch = p.match(/^(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|')$/i);
  if (feetMatch) {
    const feet = parseFloat(feetMatch[1] ?? '0');
    return Math.round(feet * MM_PER_FOOT);
  }

  // 3. Single inches: "6in", "6 in", "6\""
  const inchesMatch = p.match(/^(\d+(?:\.\d+)?)\s*(?:in|inches|inch|")$/i);
  if (inchesMatch) {
    const inches = parseFloat(inchesMatch[1] ?? '0');
    return Math.round(inches * MM_PER_INCH);
  }

  // 4. Meters: "3.5m", "3.5 m", "3.5 meters", "3.5 metres"
  const metersMatch = p.match(/^(\d+(?:\.\d+)?)\s*(?:m|meter|meters|metre|metres)$/i);
  if (metersMatch) {
    const meters = parseFloat(metersMatch[1] ?? '0');
    return Math.round(meters * 1000);
  }

  // 5. Centimeters: "150cm", "150 cm"
  const cmMatch = p.match(/^(\d+(?:\.\d+)?)\s*(?:cm|centimeter|centimeters)$/i);
  if (cmMatch) {
    const cm = parseFloat(cmMatch[1] ?? '0');
    return Math.round(cm * 10);
  }

  // 6. Millimeters: "200mm", "200 mm"
  const mmMatch = p.match(/^(\d+(?:\.\d+)?)\s*(?:mm|millimeter|millimeters)$/i);
  if (mmMatch) {
    return Math.round(parseFloat(mmMatch[1] ?? '0'));
  }

  return null;
}

/**
 * Parses an individual area phrase into square meters.
 */
export function parseAreaToSqM(phrase: string): number | null {
  const p = phrase.trim().toLowerCase();

  // Imperial square feet: "150 sq ft", "150 sqft", "150 sq.ft.", "150 square feet"
  const sqftMatch = p.match(/^(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|sq\.ft\.?|square\s*feet|square\s*foot)$/i);
  if (sqftMatch) {
    const sqft = parseFloat(sqftMatch[1] ?? '0');
    return Number((sqft * SQM_PER_SQFT).toFixed(2));
  }

  // Metric square meters: "50 sq m", "50 sqm", "50 sq.m.", "50 m2", "50 m²"
  const sqmMatch = p.match(/^(\d+(?:\.\d+)?)\s*(?:sq\s*m|sqm|sq\.m\.?|square\s*meter|square\s*meters|m2|m²)$/i);
  if (sqmMatch) {
    return Number(parseFloat(sqmMatch[1] ?? '0').toFixed(2));
  }

  return null;
}

/**
 * Normalizes all informal/imperial and metric unit expressions in a prompt.
 */
export function normalizePromptUnits(prompt: string): PromptNormalizationResult {
  const conversions: UnitConversion[] = [];
  let normalizedPrompt = prompt;

  // 1. Dimensional pairs: e.g. "30x40 ft", "30 x 40 ft", "30ft x 40ft", "30' x 40'"
  const pairRegex = /\b(\d+(?:\.\d+)?)\s*(?:ft|'|)?\s*(?:x|by|\*)\s*(\d+(?:\.\d+)?)\s*(?:ft|'|feet)\b/gi;
  normalizedPrompt = normalizedPrompt.replace(pairRegex, (match, wStr, hStr) => {
    const wFt = parseFloat(wStr);
    const hFt = parseFloat(hStr);
    const wMm = Math.round(wFt * MM_PER_FOOT);
    const hMm = Math.round(hFt * MM_PER_FOOT);
    const replacement = `${wMm}mm x ${hMm}mm`;
    conversions.push({
      raw: match,
      kind: 'dimension_pair',
      widthMm: wMm,
      heightMm: hMm,
      replacement,
    });
    return replacement;
  });

  // 2. Compound feet and inches: "12ft 6in", "12'6\"", "12' 6\""
  const compoundRegex = /\b(\d+(?:\.\d+)?)\s*(?:ft|')\s*(\d+(?:\.\d+)?)\s*(?:in|"|'')\b/gi;
  normalizedPrompt = normalizedPrompt.replace(compoundRegex, (match, fStr, iStr) => {
    const feet = parseFloat(fStr);
    const inches = parseFloat(iStr);
    const mm = Math.round((feet * 12 + inches) * MM_PER_INCH);
    const replacement = `${mm}mm`;
    conversions.push({
      raw: match,
      kind: 'length',
      valueMm: mm,
      replacement,
    });
    return replacement;
  });

  // 3. Area square feet: "150 sq ft", "150 sqft", "150 sq.ft."
  const sqftRegex = /\b(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft|sq\.ft\.?|square\s*feet)\b/gi;
  normalizedPrompt = normalizedPrompt.replace(sqftRegex, (match, numStr) => {
    const sqft = parseFloat(numStr);
    const sqm = Number((sqft * SQM_PER_SQFT).toFixed(2));
    const replacement = `${sqm}m²`;
    conversions.push({
      raw: match,
      kind: 'area',
      valueSqM: sqm,
      replacement,
    });
    return replacement;
  });

  // 4. Single feet: "12ft", "12 ft", "12'"
  const feetRegex = /\b(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|')\b/gi;
  normalizedPrompt = normalizedPrompt.replace(feetRegex, (match, numStr) => {
    const feet = parseFloat(numStr);
    const mm = Math.round(feet * MM_PER_FOOT);
    const replacement = `${mm}mm`;
    conversions.push({
      raw: match,
      kind: 'length',
      valueMm: mm,
      replacement,
    });
    return replacement;
  });

  // 5. Single inches: "6in", "6 in"
  const inchesRegex = /\b(\d+(?:\.\d+)?)\s*(?:in|inches|inch)\b/gi;
  normalizedPrompt = normalizedPrompt.replace(inchesRegex, (match, numStr) => {
    const inches = parseFloat(numStr);
    const mm = Math.round(inches * MM_PER_INCH);
    const replacement = `${mm}mm`;
    conversions.push({
      raw: match,
      kind: 'length',
      valueMm: mm,
      replacement,
    });
    return replacement;
  });

  // 6. Meters: "3.5m", "3.5 meters", "3.5 metres"
  const metersRegex = /\b(\d+(?:\.\d+)?)\s*(?:meters|metres|meter|metre)\b/gi;
  normalizedPrompt = normalizedPrompt.replace(metersRegex, (match, numStr) => {
    const meters = parseFloat(numStr);
    const mm = Math.round(meters * 1000);
    const replacement = `${mm}mm`;
    conversions.push({
      raw: match,
      kind: 'length',
      valueMm: mm,
      replacement,
    });
    return replacement;
  });

  // Annotated prompt: includes original wording with canonical hints in brackets
  let annotatedPrompt = prompt;
  for (const c of conversions) {
    if (c.kind === 'dimension_pair') {
      annotatedPrompt = annotatedPrompt.replace(c.raw, `${c.raw} [${c.widthMm}mm x ${c.heightMm}mm]`);
    } else if (c.kind === 'length') {
      annotatedPrompt = annotatedPrompt.replace(c.raw, `${c.raw} [${c.valueMm}mm]`);
    } else if (c.kind === 'area') {
      annotatedPrompt = annotatedPrompt.replace(c.raw, `${c.raw} [${c.valueSqM}m²]`);
    }
  }

  return {
    normalizedPrompt,
    annotatedPrompt,
    conversions,
  };
}

/**
 * Appends normalized unit conversion hints to an AI editing prompt.
 */
export function attachNormalizedUnitContext(prompt: string): string {
  const result = normalizePromptUnits(prompt);
  if (result.conversions.length === 0) {
    return prompt;
  }

  const hints = result.conversions
    .map((c) => {
      if (c.kind === 'dimension_pair') {
        return `"${c.raw}" = ${c.widthMm}mm wide by ${c.heightMm}mm deep`;
      }
      if (c.kind === 'length') {
        return `"${c.raw}" = ${c.valueMm}mm`;
      }
      return `"${c.raw}" = ${c.valueSqM}m²`;
    })
    .join('; ');

  return `${prompt}\n[Unit Normalization: ${hints}]`;
}

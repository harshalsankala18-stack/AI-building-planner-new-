import { describe, it, expect } from 'vitest';
import {
  parseDimensionToMm,
  parseAreaToSqM,
  normalizePromptUnits,
  attachNormalizedUnitContext,
} from '../units/unit-normalizer.js';

describe('unit-normalizer', () => {
  describe('parseDimensionToMm', () => {
    it('parses compound feet and inches', () => {
      expect(parseDimensionToMm('12ft 6in')).toBe(3810);
      expect(parseDimensionToMm("12'6\"")).toBe(3810);
      expect(parseDimensionToMm("10' 4\"")).toBe(3150);
    });

    it('parses single feet', () => {
      expect(parseDimensionToMm('12ft')).toBe(3658);
      expect(parseDimensionToMm('2ft')).toBe(610);
      expect(parseDimensionToMm("15'")).toBe(4572);
      expect(parseDimensionToMm('10 feet')).toBe(3048);
    });

    it('parses single inches', () => {
      expect(parseDimensionToMm('6in')).toBe(152);
      expect(parseDimensionToMm('24 inches')).toBe(610);
      expect(parseDimensionToMm('8"')).toBe(203);
    });

    it('parses metric dimensions', () => {
      expect(parseDimensionToMm('3.5m')).toBe(3500);
      expect(parseDimensionToMm('4 meters')).toBe(4000);
      expect(parseDimensionToMm('150cm')).toBe(1500);
      expect(parseDimensionToMm('200mm')).toBe(200);
    });

    it('returns null for unrecognized input', () => {
      expect(parseDimensionToMm('large room')).toBeNull();
      expect(parseDimensionToMm('')).toBeNull();
    });
  });

  describe('parseAreaToSqM', () => {
    it('parses square feet into square meters', () => {
      const sqm = parseAreaToSqM('150 sq ft');
      expect(sqm).toBeCloseTo(13.94, 1);

      expect(parseAreaToSqM('1000 sqft')).toBeCloseTo(92.9, 1);
      expect(parseAreaToSqM('500 square feet')).toBeCloseTo(46.45, 1);
    });

    it('parses square meters', () => {
      expect(parseAreaToSqM('50 sq m')).toBe(50);
      expect(parseAreaToSqM('75 sqm')).toBe(75);
      expect(parseAreaToSqM('120 m2')).toBe(120);
      expect(parseAreaToSqM('120 m²')).toBe(120);
    });
  });

  describe('normalizePromptUnits & attachNormalizedUnitContext', () => {
    it('normalizes imperial expansion prompt', () => {
      const res = normalizePromptUnits('Expand living room by 2ft');
      expect(res.normalizedPrompt).toBe('Expand living room by 610mm');
      expect(res.conversions).toHaveLength(1);
      expect(res.conversions[0]?.valueMm).toBe(610);
      expect(res.annotatedPrompt).toContain('2ft [610mm]');
    });

    it('normalizes dimension pairs such as 30x40 ft plot', () => {
      const res = normalizePromptUnits('Create a 30x40 ft layout with a 12ft 6in master bedroom');
      expect(res.normalizedPrompt).toContain('9144mm x 12192mm');
      expect(res.normalizedPrompt).toContain('3810mm');
      expect(res.conversions).toHaveLength(2);
    });

    it('normalizes area phrases like 150 sq ft', () => {
      const res = normalizePromptUnits('Add an ensuite bathroom of 150 sq ft');
      expect(res.normalizedPrompt).toContain('13.94m²');
    });

    it('attaches unit context safely when units are detected', () => {
      const withContext = attachNormalizedUnitContext('Expand the kitchen by 3ft and bedroom by 12in');
      expect(withContext).toContain('[Unit Normalization:');
      expect(withContext).toContain('"3ft" = 914mm');
      expect(withContext).toContain('"12in" = 305mm');
    });

    it('leaves prompt untouched when no unit phrases exist', () => {
      const plain = 'Enlarge the living room and rename to Grand Salon';
      expect(attachNormalizedUnitContext(plain)).toBe(plain);
    });
  });
});

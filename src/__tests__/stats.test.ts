import { describe, it, expect } from 'vitest';
import { compress, stats } from '../index.js';

describe('stats', () => {
  const data = [
    { name: 'Alice', lang: 'TypeScript', id: 'A1' },
    { name: 'Bob',   lang: 'TypeScript', id: 'A2' },
    { name: 'Carol', lang: 'TypeScript', id: 'A3' },
  ];

  it('returns correct originalChars', () => {
    const json = JSON.stringify(data);
    const compressed = compress(data);
    const s = stats(json, compressed);
    expect(s.originalChars).toBe(json.length);
  });

  it('returns correct compressedChars', () => {
    const json = JSON.stringify(data);
    const compressed = compress(data);
    const s = stats(json, compressed);
    expect(s.compressedChars).toBe(compressed.length);
  });

  it('ratio equals compressedChars / originalChars (rounded to 4dp)', () => {
    const json = JSON.stringify(data);
    const compressed = compress(data);
    const s = stats(json, compressed);
    expect(s.ratio).toBe(parseFloat((s.compressedChars / s.originalChars).toFixed(4)));
  });

  it('savings is a percentage string', () => {
    const json = JSON.stringify(data);
    const compressed = compress(data);
    const s = stats(json, compressed);
    expect(s.savings).toMatch(/^\d+(\.\d+)?%$/);
  });

  it('savings reflects actual reduction', () => {
    const json = JSON.stringify(data);
    const compressed = compress(data);
    const s = stats(json, compressed);
    const expected = ((1 - s.ratio) * 100).toFixed(1) + '%';
    expect(s.savings).toBe(expected);
  });

  it('ratio < 1 when compression is effective', () => {
    const bigData = Array.from({ length: 20 }, (_, i) => ({
      lang: 'TypeScript',
      env: 'production',
      id: `ID-${i}`,
    }));
    const json = JSON.stringify(bigData);
    const compressed = compress(bigData);
    const s = stats(json, compressed);
    expect(s.ratio).toBeLessThan(1);
  });
});

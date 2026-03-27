import type { CompressionStats } from './types.js';

export function stats(originalJson: string, compressed: string): CompressionStats {
  const o = originalJson.length;
  const c = compressed.length;
  const r = c / o;
  return {
    originalChars: o,
    compressedChars: c,
    ratio: parseFloat(r.toFixed(4)),
    savings: `${((1 - r) * 100).toFixed(1)}%`,
  };
}

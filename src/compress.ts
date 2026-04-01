import type { CompressOptions } from './types.js';
import { isFlatObjectArray } from './utils/schema.js';
import { compressTabular } from './tabular/compress.js';
import { compressGeneric } from './generic/compress.js';
import { compressText } from './text/compress.js';
import { compressMixed } from './mixed/compress.js';
import { splitSegments } from './mixed/segments.js';

export function compress(data: unknown, opts: CompressOptions = {}): string {
  if (typeof data === 'string') {
    // Use mixed mode when the string contains embedded JSON at line boundaries
    if (/(?:^|\n)[ \t]*[{[]/.test(data)) {
      const segs = splitSegments(data);
      if (segs.some(s => s.type === 'json')) return compressMixed(data, opts);
    }
    return compressText(data, opts);
  }
  if (Array.isArray(data) && isFlatObjectArray(data)) return compressTabular(data, opts);
  return compressGeneric(data, opts);
}

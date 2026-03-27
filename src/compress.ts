import type { CompressOptions } from './types.js';
import { isFlatObjectArray } from './utils/schema.js';
import { compressTabular } from './tabular/compress.js';
import { compressGeneric } from './generic/compress.js';

export function compress(data: unknown, opts: CompressOptions = {}): string {
  if (Array.isArray(data) && isFlatObjectArray(data)) {
    return compressTabular(data, opts);
  }
  return compressGeneric(data, opts);
}

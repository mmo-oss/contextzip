import { MIXED_MARKER, SCHEMA_MARKER, TEXT_MARKER } from './constants.js';
import { decompressTabular } from './tabular/decompress.js';
import { decompressGeneric } from './generic/decompress.js';
import { decompressText } from './text/decompress.js';
import { decompressMixed } from './mixed/decompress.js';

export function decompress(input: string): unknown {
  const lines = input.split('\n');
  let i = 0;

  const ver = lines[i++];
  if (!ver.startsWith('CTX/')) throw new Error(`Unsupported format: ${ver}`);

  if (lines[i] === MIXED_MARKER)  return decompressMixed(input);
  if (lines[i] === TEXT_MARKER)   return decompressText(lines, i + 1);
  if (lines[i]?.startsWith(SCHEMA_MARKER)) return decompressTabular(lines, i);
  return decompressGeneric(lines, i);
}

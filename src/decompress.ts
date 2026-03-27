import { SCHEMA_MARKER } from './constants.js';
import { decompressTabular } from './tabular/decompress.js';
import { decompressGeneric } from './generic/decompress.js';

export function decompress(input: string): unknown {
  const lines = input.split('\n');
  let i = 0;

  const ver = lines[i++];
  if (!ver.startsWith('CTX/')) throw new Error(`Unsupported format: ${ver}`);

  return lines[i]?.startsWith(SCHEMA_MARKER)
    ? decompressTabular(lines, i)
    : decompressGeneric(lines, i);
}

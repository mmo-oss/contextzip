import { PHRASE_PREFIX, SCHEMA_MARKER } from '../constants.js';
import { SEG_OPEN_PREFIX, SEG_CLOSE } from '../constants.js';
import { decompressTabular } from '../tabular/decompress.js';
import { decompressGeneric } from '../generic/decompress.js';
import { applyPhraseDecoding } from '../utils/phrases.js';

function decompressInner(block: string): unknown {
  const lines = block.split('\n');
  const i = 1; // skip 'CTX/2' header line
  if (lines[i]?.startsWith(SCHEMA_MARKER)) return decompressTabular(lines, i);
  return decompressGeneric(lines, i);
}

function parsePhraseDict(input: string): Map<string, string> {
  const decode = new Map<string, string>();
  for (const line of input.split('\n')) {
    if (!line.startsWith(PHRASE_PREFIX)) continue;
    const eq = line.indexOf('=');
    decode.set(line.slice(0, eq), line.slice(eq + 1));
  }
  return decode;
}

export function decompressMixed(input: string): string {
  // Split header from data at the first standalone '~' line
  const tildeSep = '\n~\n';
  const tildePos = input.indexOf(tildeSep);
  const header = tildePos !== -1 ? input.slice(0, tildePos) : '';
  const dataStr = tildePos !== -1 ? input.slice(tildePos + tildeSep.length) : '';

  const phraseDecode = parsePhraseDict(header);

  // Walk the data section, replacing <<<CTX:N ... <<<END>>> blocks with decompressed JSON
  let result = '';
  let pos = 0;

  while (pos <= dataStr.length) {
    const openIdx = dataStr.indexOf(SEG_OPEN_PREFIX, pos);

    if (openIdx === -1) {
      result += applyPhraseDecoding(dataStr.slice(pos), phraseDecode);
      break;
    }

    // Text before this JSON segment
    result += applyPhraseDecoding(dataStr.slice(pos, openIdx), phraseDecode);

    // Parse indent value from <<<CTX:N\n
    const nlIdx = dataStr.indexOf('\n', openIdx);
    if (nlIdx === -1) break;
    const indent = parseInt(dataStr.slice(openIdx + SEG_OPEN_PREFIX.length, nlIdx)) || 0;
    const innerStart = nlIdx + 1;

    // Find the closing marker
    const closeIdx = dataStr.indexOf(SEG_CLOSE, innerStart);
    if (closeIdx === -1) throw new Error('Unclosed mixed segment');

    // Inner block is everything between the open marker and <<<END>>>
    const value = decompressInner(dataStr.slice(innerStart, closeIdx));
    result += JSON.stringify(value, null, indent || undefined);

    pos = closeIdx + SEG_CLOSE.length;
  }

  return result;
}

import { BASE62, DATA_MARKER, FORMAT, PHRASE_PREFIX } from '../constants.js';
import { MIXED_MARKER, SEG_OPEN_PREFIX, SEG_CLOSE } from '../constants.js';
import type { CompressOptions } from '../types.js';
import { isFlatObjectArray } from '../utils/schema.js';
import { compressTabular } from '../tabular/compress.js';
import { compressGeneric } from '../generic/compress.js';
import { findRepeatedPhrases, buildPhraseEncoder, applyPhraseEncoding } from '../utils/phrases.js';
import { splitSegments } from './segments.js';
import type { Segment } from './segments.js';

function compressJsonValue(value: unknown, opts: CompressOptions): string {
  if (Array.isArray(value) && isFlatObjectArray(value as Record<string, unknown>[]))
    return compressTabular(value as Record<string, unknown>[], opts);
  return compressGeneric(value, opts);
}

export function compressMixed(text: string, opts: CompressOptions = {}): string {
  const { minPhraseFreq = 2 } = opts;
  const segments = splitSegments(text);

  // Build phrase dict from text segments only (JSON parts are compressed separately)
  const combinedText = segments
    .filter((s): s is { type: 'text'; content: string } => s.type === 'text')
    .map(s => s.content)
    .join('\n');

  const phrases = findRepeatedPhrases(combinedText, minPhraseFreq);
  const phraseEncode = buildPhraseEncoder(phrases);

  // Build the data section by concatenating encoded text and compressed JSON blocks
  let dataSection = '';
  for (const seg of segments) {
    if (seg.type === 'text') {
      dataSection += applyPhraseEncoding(seg.content, phraseEncode);
    } else {
      const inner = compressJsonValue(seg.value, opts);
      dataSection += `${SEG_OPEN_PREFIX}${seg.indent ?? 0}\n${inner}${SEG_CLOSE}`;
    }
  }

  const dictLines = phrases.map((p, i) => `${PHRASE_PREFIX}${BASE62[i]}=${p}`);
  return [FORMAT, MIXED_MARKER, ...dictLines, DATA_MARKER].join('\n') + '\n' + dataSection;
}

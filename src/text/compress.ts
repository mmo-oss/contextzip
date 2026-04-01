import { BASE62, DATA_MARKER, FORMAT, PHRASE_PREFIX, TEXT_MARKER } from '../constants.js';
import type { CompressOptions } from '../types.js';
import { findRepeatedPhrases, buildPhraseEncoder, applyPhraseEncoding } from '../utils/phrases.js';

export function compressText(text: string, opts: CompressOptions = {}): string {
  const { minPhraseFreq = 2 } = opts;

  const phrases = findRepeatedPhrases(text, minPhraseFreq);
  const phraseEncode = buildPhraseEncoder(phrases);
  const encoded = applyPhraseEncoding(text, phraseEncode);
  const dictLines = phrases.map((p, i) => `${PHRASE_PREFIX}${BASE62[i]}=${p}`);

  return [FORMAT, TEXT_MARKER, ...dictLines, DATA_MARKER, encoded].join('\n');
}

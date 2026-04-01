import { BASE62, PHRASE_PREFIX } from '../constants.js';

const MIN_SEGMENT_LEN = 15;
const MIN_WORD_LEN = 5;

export function countOccurrences(text: string, phrase: string): number {
  let count = 0;
  let pos = 0;
  while ((pos = text.indexOf(phrase, pos)) !== -1) {
    count++;
    pos += phrase.length;
  }
  return count;
}

export function findRepeatedPhrases(text: string, minFreq: number): string[] {
  const candidates = new Map<string, number>();

  for (const raw of [...text.split('\n'), ...text.split(/\.\s+/)]) {
    const phrase = raw.trim();
    if (phrase.length >= MIN_SEGMENT_LEN && !candidates.has(phrase)) {
      const freq = countOccurrences(text, phrase);
      if (freq >= minFreq) candidates.set(phrase, freq);
    }
  }

  const words = text.split(/\s+/);
  const maxN = Math.min(10, words.length);
  outer: for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      if (candidates.size > 4000) break outer;
      const phrase = words.slice(i, i + n).join(' ');
      if (phrase.length >= MIN_WORD_LEN && !candidates.has(phrase)) {
        const freq = countOccurrences(text, phrase);
        if (freq >= minFreq) candidates.set(phrase, freq);
      }
    }
  }

  const sorted = [...candidates.entries()]
    .sort((a, b) => (b[1] - 1) * b[0].length - (a[1] - 1) * a[0].length);

  const selected: string[] = [];
  for (const [phrase] of sorted) {
    if (selected.length >= BASE62.length) break;
    if (!selected.some(s => s.includes(phrase) || phrase.includes(s)))
      selected.push(phrase);
  }

  return selected;
}

export function buildPhraseEncoder(phrases: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (let i = 0; i < phrases.length; i++)
    map.set(phrases[i], `${PHRASE_PREFIX}${BASE62[i]}`);
  return map;
}

export function applyPhraseEncoding(text: string, encode: Map<string, string>): string {
  let out = text;
  for (const [phrase, token] of encode)
    out = out.split(phrase).join(token);
  return out;
}

export function applyPhraseDecoding(text: string, decode: Map<string, string>): string {
  let out = text;
  for (const [token, phrase] of decode)
    out = out.split(token).join(phrase);
  return out;
}

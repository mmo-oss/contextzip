import { DATA_MARKER, PHRASE_PREFIX } from '../constants.js';

export function decompressText(lines: string[], i: number): string {
  const phraseDecode = new Map<string, string>();

  while (i < lines.length && lines[i].startsWith(PHRASE_PREFIX)) {
    const line = lines[i++];
    const eq = line.indexOf('=');
    phraseDecode.set(line.slice(0, eq), line.slice(eq + 1));
  }

  if (i < lines.length && lines[i] === DATA_MARKER) i++;

  let text = lines.slice(i).join('\n');

  for (const [token, phrase] of phraseDecode)
    text = text.split(token).join(phrase);

  return text;
}

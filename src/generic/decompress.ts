import { DATA_MARKER, ENUM_PREFIX, KEY_PREFIX } from '../constants.js';
import { reverseTokens } from '../utils/json-tree.js';

export function decompressGeneric(lines: string[], i: number): unknown {
  const keyDecode = new Map<string, string>();
  while (i < lines.length && lines[i].startsWith(KEY_PREFIX)) {
    const line = lines[i++];
    const eq = line.indexOf('=');
    keyDecode.set(line.slice(0, eq), line.slice(eq + 1));
  }

  const valDecode = new Map<string, string>();
  while (i < lines.length && lines[i].startsWith(ENUM_PREFIX)) {
    const line = lines[i++];
    const eq = line.indexOf('=');
    valDecode.set(line.slice(0, eq), line.slice(eq + 1));
  }

  if (i < lines.length && lines[i] === DATA_MARKER) i++;

  const tokenized = JSON.parse(lines.slice(i).join('\n'));
  return reverseTokens(tokenized, valDecode, keyDecode);
}

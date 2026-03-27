import { DATA_MARKER, ENUM_PREFIX, PHRASE_PREFIX, SEP } from '../constants.js';
import type { FieldDef, FieldType } from '../types.js';
import { decodeText } from '../utils/sentences.js';

export function decompressTabular(lines: string[], i: number): unknown[] {
  const schema: FieldDef[] = lines[i++].slice(1).split(SEP).map(p => {
    const ci = p.indexOf(':');
    return { name: p.slice(0, ci), type: p.slice(ci + 1) as FieldType };
  });

  const enumDecode = new Map<string, string>();
  while (i < lines.length && lines[i].startsWith(ENUM_PREFIX)) {
    const line = lines[i++];
    const eq = line.indexOf('=');
    enumDecode.set(line.slice(0, eq), line.slice(eq + 1));
  }

  const phraseDecode = new Map<string, string>();
  while (i < lines.length && lines[i].startsWith(PHRASE_PREFIX)) {
    const line = lines[i++];
    const eq = line.indexOf('=');
    phraseDecode.set(line.slice(0, eq), line.slice(eq + 1));
  }

  if (i < lines.length && lines[i] === DATA_MARKER) i++;

  const result: Record<string, unknown>[] = [];

  while (i < lines.length) {
    const line = lines[i++];
    if (!line.trim()) continue;

    const cols = line.split(SEP);
    const obj: Record<string, unknown> = {};

    for (let fi = 0; fi < schema.length; fi++) {
      const { name, type } = schema[fi];
      const raw = cols[fi] ?? '';

      if (type === 't') {
        obj[name] = decodeText(raw, phraseDecode);

      } else if (type === 's') {
        if (raw.startsWith(ENUM_PREFIX)) {
          obj[name] = enumDecode.get(raw) ?? raw;
        } else {
          obj[name] = raw;
        }

      } else {
        const dec = parseInt(type.slice(1)) || 0;
        obj[name] = parseFloat((parseInt(raw, 10) / 10 ** dec).toFixed(dec));
      }
    }

    result.push(obj);
  }

  return result;
}

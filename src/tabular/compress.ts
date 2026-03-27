import { BASE62, DATA_MARKER, ENUM_PREFIX, FORMAT, PHRASE_PREFIX, SCHEMA_MARKER, SEP } from '../constants.js';
import type { CompressOptions, FieldDef } from '../types.js';
import { encodeText, splitSentences } from '../utils/sentences.js';
import { inferType } from '../utils/schema.js';

export function compressTabular(
  recs: Record<string, unknown>[],
  opts: CompressOptions,
): string {
  const { minEnumFreq = 2, minPhraseFreq = 2 } = opts;

  const keys: string[] = [];
  const keySet = new Set<string>();
  for (const r of recs)
    for (const k of Object.keys(r))
      if (!keySet.has(k)) { keySet.add(k); keys.push(k); }

  const schema: FieldDef[] = keys.map(name => ({
    name,
    type: inferType(recs.map(r => r[name])),
  }));

  const enumEncode = new Map<string, string>();
  let eIdx = 0;
  for (const { name, type } of schema) {
    if (type !== 's') continue;
    const freq = new Map<string, number>();
    for (const r of recs) {
      const v = String(r[name] ?? '');
      if (v.length > 0 && v.length < 80) freq.set(v, (freq.get(v) ?? 0) + 1);
    }
    for (const [val, cnt] of freq)
      if (cnt >= minEnumFreq && val.length > 3 && !enumEncode.has(val))
        enumEncode.set(val, `${ENUM_PREFIX}${eIdx++}`);
  }

  const phraseFreq = new Map<string, number>();
  for (const { name, type } of schema) {
    if (type !== 't') continue;
    for (const r of recs)
      for (const s of splitSentences(String(r[name] ?? '')))
        if (s.length > 15) phraseFreq.set(s, (phraseFreq.get(s) ?? 0) + 1);
  }

  const phraseEncode = new Map<string, string>();
  const eligible = [...phraseFreq.entries()]
    .filter(([, c]) => c >= minPhraseFreq)
    .sort((a, b) => b[1] * b[0].length - a[1] * a[0].length);

  for (let i = 0; i < Math.min(eligible.length, BASE62.length); i++)
    phraseEncode.set(eligible[i][0], `${PHRASE_PREFIX}${BASE62[i]}`);

  const rows: string[] = [];

  for (const r of recs) {
    const cols: string[] = [];
    for (const { name, type } of schema) {
      const raw = r[name];

      if (type === 't') {
        cols.push(encodeText(String(raw ?? ''), phraseEncode));

      } else if (type === 's') {
        const v = String(raw ?? '');
        if (enumEncode.has(v)) {
          cols.push(enumEncode.get(v)!);
        } else {
          cols.push(v);
        }

      } else {
        const dec = parseInt(type.slice(1)) || 0;
        cols.push(String(Math.round(Number(raw ?? 0) * 10 ** dec)));
      }
    }
    rows.push(cols.join(SEP));
  }

  const schemaLine = `${SCHEMA_MARKER}${schema.map(f => `${f.name}:${f.type}`).join(SEP)}`;
  const enumLines = [...enumEncode.entries()]
    .sort((a, b) => parseInt(a[1].slice(1)) - parseInt(b[1].slice(1)))
    .map(([v, t]) => `${t}=${v}`);
  const phraseLines = [...phraseEncode.entries()].map(([p, t]) => `${t}=${p}`);

  return [FORMAT, schemaLine, ...enumLines, ...phraseLines, DATA_MARKER, ...rows].join('\n');
}

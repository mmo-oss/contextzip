import { DATA_MARKER, ENUM_PREFIX, FORMAT, KEY_PREFIX } from '../constants.js';
import type { CompressOptions } from '../types.js';
import { collectKeys, collectValues, applyTokens } from '../utils/json-tree.js';

export function compressGeneric(data: unknown, opts: CompressOptions): string {
  const { minEnumFreq = 2 } = opts;

  const valFreq = new Map<string, number>();
  collectValues(data, valFreq);

  const keyFreq = new Map<string, number>();
  collectKeys(data, keyFreq);

  const valEncode = new Map<string, string>();
  let vIdx = 0;
  for (const [val] of [...valFreq.entries()]
    .filter(([v, c]) => c >= minEnumFreq && v.length > 2)
    .sort((a, b) => b[1] * b[0].length - a[1] * a[0].length))
    valEncode.set(val, `${ENUM_PREFIX}${vIdx++}`);

  const keyEncode = new Map<string, string>();
  let kIdx = 0;
  for (const [key] of [...keyFreq.entries()]
    .filter(([k, c]) => c >= minEnumFreq && k.length > 2)
    .sort((a, b) => b[1] * b[0].length - a[1] * a[0].length))
    keyEncode.set(key, `${KEY_PREFIX}${kIdx++}`);

  const tokenized = applyTokens(data, valEncode, keyEncode);
  const jsonStr = JSON.stringify(tokenized);

  const keyLines = [...keyEncode.entries()].map(([k, t]) => `${t}=${k}`);
  const valLines = [...valEncode.entries()].map(([v, t]) => `${t}=${v}`);

  return [FORMAT, ...keyLines, ...valLines, DATA_MARKER, jsonStr].join('\n');
}

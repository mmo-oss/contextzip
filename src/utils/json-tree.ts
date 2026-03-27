export function collectValues(node: unknown, freq: Map<string, number>): void {
  if (typeof node === 'string') {
    freq.set(node, (freq.get(node) ?? 0) + 1);
  } else if (Array.isArray(node)) {
    for (const item of node) collectValues(item, freq);
  } else if (node !== null && typeof node === 'object') {
    for (const v of Object.values(node as Record<string, unknown>))
      collectValues(v, freq);
  }
}

export function collectKeys(node: unknown, freq: Map<string, number>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectKeys(item, freq);
  } else if (node !== null && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      freq.set(k, (freq.get(k) ?? 0) + 1);
      collectKeys(v, freq);
    }
  }
}

export function applyTokens(
  node: unknown,
  vMap: Map<string, string>,
  kMap: Map<string, string>,
): unknown {
  if (typeof node === 'string') return vMap.get(node) ?? node;
  if (Array.isArray(node)) return node.map(i => applyTokens(i, vMap, kMap));
  if (node !== null && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>))
      out[kMap.get(k) ?? k] = applyTokens(v, vMap, kMap);
    return out;
  }
  return node;
}

export function reverseTokens(
  node: unknown,
  vMap: Map<string, string>,
  kMap: Map<string, string>,
): unknown {
  if (typeof node === 'string') return vMap.get(node) ?? node;
  if (Array.isArray(node)) return node.map(i => reverseTokens(i, vMap, kMap));
  if (node !== null && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>))
      out[kMap.get(k) ?? k] = reverseTokens(v, vMap, kMap);
    return out;
  }
  return node;
}

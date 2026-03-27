import type { FieldType } from '../types.js';

export function inferType(values: unknown[]): FieldType {
  const nn = values.filter(v => v != null);
  if (!nn.length) return 's';

  if (nn.every(v => typeof v === 'number')) {
    const maxDec = (nn as number[]).reduce((m, v) => {
      const d = String(v).indexOf('.');
      return d < 0 ? m : Math.max(m, String(v).length - d - 1);
    }, 0);
    return `n${maxDec}` as FieldType;
  }

  const avg = nn.map(v => String(v)).reduce((a, b) => a + b.length, 0) / nn.length;
  return avg > 60 ? 't' : 's';
}

export function isFlatObjectArray(data: unknown[]): data is Record<string, unknown>[] {
  return (
    data.length > 0 &&
    data.every(
      item =>
        item !== null &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        Object.values(item as object).every(v => v === null || typeof v !== 'object'),
    )
  );
}

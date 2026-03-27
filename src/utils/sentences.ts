export function splitSentences(text: string): string[] {
  const t = text.trimEnd().replace(/\.$/, '');
  return t.split(/\.\s+/).map(s => s.trim());
}

export function encodeText(text: string, dict: Map<string, string>): string {
  if (!text) return '.';
  return splitSentences(text).map(s => dict.get(s) ?? s).join('. ') + '.';
}

export function decodeText(encoded: string, dict: Map<string, string>): string {
  if (!encoded || encoded === '.') return '';
  const hasDot = encoded.endsWith('.');
  const s = hasDot ? encoded.slice(0, -1) : encoded;
  return (
    s.split(/\.\s+/)
      .map(p => dict.get(p.trim()) ?? p.trim())
      .join('. ') + (hasDot ? '.' : '')
  );
}

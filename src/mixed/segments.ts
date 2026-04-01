export interface TextSegment { type: 'text'; content: string; }
export interface JsonSegment { type: 'json'; content: string; value: unknown; indent: number | null; }
export type Segment = TextSegment | JsonSegment;

/** Scan forward from `start` tracking brackets/strings; return index past closing bracket, or -1. */
function findJsonEnd(text: string, start: number): number {
  const opener = text[start];
  const closer = opener === '[' ? ']' : '}';
  let depth = 0, inString = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape)            { escape = false; continue; }
    if (c === '\\' && inString) { escape = true;  continue; }
    if (c === '"')         { inString = !inString; continue; }
    if (inString)          continue;
    if (c === opener)      depth++;
    else if (c === closer && --depth === 0) return i + 1;
  }
  return -1;
}

/** Detect the indentation used in a JSON string (null = compact / no indent). */
export function detectIndent(jsonStr: string): number | null {
  const m = jsonStr.match(/\n( +)/);
  return m ? m[1].length : null;
}

/**
 * Split a string into alternating text / JSON segments.
 * A JSON segment is a `[` or `{` that:
 *   - starts at a line boundary (only whitespace before it on its line), AND
 *   - parses successfully with JSON.parse.
 */
export function splitSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;
  let textStart = 0;

  while (pos < text.length) {
    const c = text[pos];
    if (c === '[' || c === '{') {
      // Only consider as JSON if it sits at a line boundary
      const lineStart = text.lastIndexOf('\n', pos - 1) + 1; // 0 if no preceding newline
      if (/^[ \t]*$/.test(text.slice(lineStart, pos))) {
        const end = findJsonEnd(text, pos);
        if (end !== -1) {
          const jsonStr = text.slice(pos, end);
          let parsed: unknown;
          try { parsed = JSON.parse(jsonStr); } catch { pos++; continue; }

          if (pos > textStart)
            segments.push({ type: 'text', content: text.slice(textStart, pos) });

          segments.push({ type: 'json', content: jsonStr, value: parsed, indent: detectIndent(jsonStr) });
          textStart = end;
          pos = end;
          continue;
        }
      }
    }
    pos++;
  }

  if (textStart < text.length)
    segments.push({ type: 'text', content: text.slice(textStart) });

  return segments;
}

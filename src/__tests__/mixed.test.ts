import { describe, it, expect } from 'vitest';
import { compress, decompress, stats } from '../index.js';

const RECORDS = [
  { name: 'Alice', role: 'admin',  status: 'active',   department: 'engineering' },
  { name: 'Bob',   role: 'user',   status: 'active',   department: 'marketing'   },
  { name: 'Carol', role: 'admin',  status: 'inactive', department: 'engineering' },
  { name: 'Dave',  role: 'user',   status: 'active',   department: 'engineering' },
];

function makePrompt(indent: number | null) {
  const json = indent === null
    ? JSON.stringify(RECORDS)
    : JSON.stringify(RECORDS, null, indent);
  return `You are a helpful data analyst. Analyze the following records carefully.\n\nHere is the data:\n${json}\n\nFor each record, provide a summary. You are a helpful data analyst.`;
}

describe('mixed mode', () => {
  it('uses @mixed marker for string input containing JSON', () => {
    const out = compress(makePrompt(2));
    expect(out.split('\n')[1]).toBe('@mixed');
  });

  it('round-trips prompt with 2-space indented JSON', () => {
    const original = makePrompt(2);
    expect(decompress(compress(original))).toBe(original);
  });

  it('round-trips prompt with 4-space indented JSON', () => {
    const original = makePrompt(4);
    expect(decompress(compress(original))).toBe(original);
  });

  it('round-trips prompt with compact JSON', () => {
    const original = makePrompt(null);
    expect(decompress(compress(original))).toBe(original);
  });

  it('embeds a compressed CTX/2 block for the JSON portion', () => {
    const out = compress(makePrompt(2));
    expect(out).toContain('CTX/2');        // inner block
    expect(out).toContain('<<<CTX:2');     // segment marker with indent
    expect(out).toContain('<<<END>>>');    // closing marker
  });

  it('applies tabular compression to flat-array JSON in the prompt', () => {
    const out = compress(makePrompt(2));
    // tabular mode uses § schema line
    expect(out).toContain('§');
  });

  it('reduces total size vs the original prompt', () => {
    const original = makePrompt(2);
    const out = compress(original);
    expect(out.length).toBeLessThan(original.length);
  });

  it('reports positive savings via stats()', () => {
    const original = makePrompt(2);
    const out = compress(original);
    const ratio = parseFloat(stats(original, out).savings);
    expect(ratio).toBeGreaterThan(0);
  });

  it('round-trips a prompt with multiple JSON blocks', () => {
    const j1 = JSON.stringify([{ id: 1, val: 'foo' }, { id: 2, val: 'foo' }], null, 2);
    const j2 = JSON.stringify({ host: 'localhost', port: 3000 });
    const original = `Intro text.\n${j1}\nMiddle text.\n${j2}\nOutro text.`;
    expect(decompress(compress(original))).toBe(original);
  });

  it('falls back to text mode when no valid JSON is at a line boundary', () => {
    const text = 'Use {placeholders} and [brackets] freely in your text.';
    const out = compress(text);
    expect(out.split('\n')[1]).toBe('@');
  });

  it('existing text/tabular/generic tests still pass (no regression)', () => {
    // text
    expect(decompress(compress('hello world'))).toBe('hello world');
    // tabular
    const rows = [{ a: 'x', b: 'y' }, { a: 'x', b: 'z' }];
    expect(decompress(compress(rows))).toEqual(rows);
    // generic
    const obj = { nested: { key: 'val' } };
    expect(decompress(compress(obj))).toEqual(obj);
  });
});

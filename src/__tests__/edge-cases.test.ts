import { describe, it, expect } from 'vitest';
import { compress, decompress } from '../index.js';

describe('edge cases', () => {
  it('round-trips empty array', () => {
    expect(decompress(compress([]))).toEqual([]);
  });

  it('round-trips empty object', () => {
    expect(decompress(compress({}))).toEqual({});
  });

  it('round-trips null', () => {
    expect(decompress(compress(null))).toBeNull();
  });

  it('round-trips a plain string', () => {
    expect(decompress(compress('hello'))).toBe('hello');
  });

  it('round-trips a number', () => {
    expect(decompress(compress(42))).toBe(42);
  });

  it('round-trips boolean true', () => {
    expect(decompress(compress(true))).toBe(true);
  });

  it('round-trips boolean false', () => {
    expect(decompress(compress(false))).toBe(false);
  });

  it('handles text fields with ". ." pattern (empty sentence artifact)', () => {
    const data = [
      { id: 1, text: 'First sentence. . Second sentence.' },
      { id: 2, text: 'First sentence. . Third sentence.' },
    ];
    const result = decompress(compress(data)) as typeof data;
    expect(result[0].text).toBe(data[0].text);
    expect(result[1].text).toBe(data[1].text);
  });

  it('handles fields with empty strings', () => {
    const data = [
      { name: 'Alice', tag: '' },
      { name: 'Bob',   tag: '' },
    ];
    const result = decompress(compress(data)) as typeof data;
    expect(result[0].tag).toBe('');
    expect(result[1].tag).toBe('');
  });

  it('does not add enum for values below minEnumFreq', () => {
    const data = [
      { lang: 'JavaScript', id: 'A' },
      { lang: 'TypeScript',  id: 'B' },
    ];
    const out = compress(data);
    expect(out).not.toContain('&0=');
  });

  it('respects custom minEnumFreq option', () => {
    const data = [
      { lang: 'JavaScript', id: 'A' },
      { lang: 'JavaScript', id: 'B' },
      { lang: 'JavaScript', id: 'C' },
    ];
    const outDefault = compress(data);
    expect(outDefault).toContain('&0=JavaScript');

    const outHigh = compress(data, { minEnumFreq: 10 });
    expect(outHigh).not.toContain('&0=JavaScript');
  });

  it('handles array of one object as flat (tabular mode)', () => {
    const data = [{ key: 'value', num: 1 }];
    const out = compress(data);
    expect(out.split('\n')[1].startsWith('§')).toBe(true);
  });

  it('switches to generic mode for nested objects in array', () => {
    const data = [
      { nested: { x: 1 }, id: 'A' },
      { nested: { x: 2 }, id: 'B' },
    ];
    const out = compress(data);
    expect(out.split('\n')[1].startsWith('§')).toBe(false);
  });

  it('switches to generic mode for arrays-as-values in flat array', () => {
    const data = [
      { tags: ['a', 'b'], id: 'X' },
      { tags: ['c'],      id: 'Y' },
    ];
    const out = compress(data);
    expect(out.split('\n')[1].startsWith('§')).toBe(false);
  });

  it('decompress throws on completely unknown format header', () => {
    expect(() => decompress('UNKNOWN\n~\n{}')).toThrow();
  });

  it('round-trips records with zero values', () => {
    const data = [
      { score: 0, name: 'Alice' },
      { score: 0, name: 'Bob'   },
    ];
    const result = decompress(compress(data)) as typeof data;
    expect(result[0].score).toBe(0);
    expect(result[1].score).toBe(0);
  });

  it('round-trips records with negative numbers', () => {
    const data = [
      { delta: -5.5, name: 'A' },
      { delta: -3.0, name: 'B' },
    ];
    const result = decompress(compress(data)) as typeof data;
    expect(result[0].delta).toBe(-5.5);
    expect(result[1].delta).toBe(-3.0);
  });
});

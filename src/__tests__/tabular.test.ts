import { describe, it, expect } from 'vitest';
import { compress, decompress } from '../index.js';

const flatRecords = [
  { name: 'Adeel Solangi', language: 'Sindhi', id: 'V59OF92YF627HFY0', version: 6.1 },
  { name: 'Afzal Ghaffar', language: 'Sindhi', id: 'ENTOCR13RSCLZ6KU', version: 1.88 },
  { name: 'Abla Dilmurat', language: 'Uyghur', id: '5ZVOEPMJUI4MB4EN', version: 2.53 },
  { name: 'Margit Adwan',  language: 'Sindhi', id: 'PTYQB2LMKC5XJYHF', version: 4.0  },
];

describe('tabular mode', () => {
  it('round-trips flat records', () => {
    const compressed = compress(flatRecords);
    expect(decompress(compressed)).toEqual(flatRecords);
  });

  it('output starts with CTX/2', () => {
    const out = compress(flatRecords);
    expect(out.startsWith('CTX/2\n')).toBe(true);
  });

  it('output contains schema line with §', () => {
    const out = compress(flatRecords);
    const lines = out.split('\n');
    expect(lines[1].startsWith('§')).toBe(true);
  });

  it('enum dict is built for repeated short strings', () => {
    const out = compress(flatRecords);
    expect(out).toContain('&0=Sindhi');
  });

  it('repeats enum token for same value in consecutive rows', () => {
    const data = [
      { lang: 'English', id: 'A1' },
      { lang: 'English', id: 'A2' },
      { lang: 'French',  id: 'A3' },
    ];
    const out = compress(data);
    const rows = out.split('\n~\n')[1].split('\n');
    expect(rows[1]).toBe('&0|A2');
  });

  it('numbers encoded with correct decimal scale', () => {
    const data = [
      { score: 6.1 },
      { score: 1.88 },
      { score: 2.5 },
    ];
    const out = compress(data);
    expect(out).toContain('§score:n2');
    expect(out).toContain('610');
    expect(out).toContain('188');
  });

  it('round-trips integer numbers', () => {
    const data = [
      { code: 200, msg: 'ok' },
      { code: 404, msg: 'not found' },
    ];
    expect(decompress(compress(data))).toEqual(data);
  });

  it('round-trips floating point numbers preserving precision', () => {
    const data = [
      { val: 6.1 },
      { val: 1.88 },
      { val: 2.53 },
    ];
    const result = decompress(compress(data)) as typeof data;
    expect(result[0].val).toBe(6.1);
    expect(result[1].val).toBe(1.88);
    expect(result[2].val).toBe(2.53);
  });

  it('round-trips long text fields with phrase dict', () => {
    const repeated = 'TypeScript adds static typing to JavaScript, catching errors at compile time.';
    const data = [
      { title: 'Post A', summary: `${repeated} First specific sentence.` },
      { title: 'Post B', summary: `${repeated} Second specific sentence.` },
      { title: 'Post C', summary: `${repeated} Third specific sentence.` },
    ];
    const result = decompress(compress(data)) as typeof data;
    expect(result[0].summary).toBe(data[0].summary);
    expect(result[1].summary).toBe(data[1].summary);
    expect(result[2].summary).toBe(data[2].summary);
  });

  it('phrase dict tokens appear in output for repeated sentences', () => {
    const repeated = 'TypeScript adds static typing to JavaScript, catching errors at compile time.';
    const data = [
      { title: 'A', summary: `${repeated} First.` },
      { title: 'B', summary: `${repeated} Second.` },
    ];
    const out = compress(data);
    expect(out).toContain('#0=TypeScript adds static typing to JavaScript, catching errors at compile time');
  });

  it('round-trips records with null values', () => {
    const data = [
      { name: 'Alice', tag: null },
      { name: 'Bob',   tag: null },
    ];
    const result = decompress(compress(data));
    expect(result).toEqual([
      { name: 'Alice', tag: '' },
      { name: 'Bob',   tag: '' },
    ]);
  });

  it('compresses strings that do not meet enum freq threshold inline', () => {
    const data = [
      { name: 'Alice',   status: 'active' },
      { name: 'Bob',     status: 'pending' },
      { name: 'Carol',   status: 'active' },
    ];
    const result = decompress(compress(data)) as typeof data;
    expect(result[0].status).toBe('active');
    expect(result[1].status).toBe('pending');
    expect(result[2].status).toBe('active');
  });

  it('handles single-record arrays', () => {
    const data = [{ id: 1, name: 'only' }];
    expect(decompress(compress(data))).toEqual(data);
  });

  it('output is smaller than JSON.stringify for repeated data', () => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      lang: 'JavaScript',
      env: 'production',
      id: `ID-${i}`,
      version: 1.0,
    }));
    const compressed = compress(data);
    expect(compressed.length).toBeLessThan(JSON.stringify(data).length);
  });
});

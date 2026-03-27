import { describe, it, expect } from 'vitest';
import { compress, decompress } from '../index.js';

const nestedConfig = {
  server: { host: 'localhost', port: 3000, env: 'production' },
  db:     { host: 'localhost', port: 5432, env: 'production' },
  cache:  { host: 'localhost', port: 6379, env: 'production' },
};

describe('generic mode', () => {
  it('round-trips nested objects', () => {
    expect(decompress(compress(nestedConfig))).toEqual(nestedConfig);
  });

  it('output starts with CTX/2', () => {
    expect(compress(nestedConfig).startsWith('CTX/2\n')).toBe(true);
  });

  it('output does not contain § schema line', () => {
    const lines = compress(nestedConfig).split('\n');
    expect(lines[1].startsWith('§')).toBe(false);
  });

  it('builds key dict for repeated keys', () => {
    const out = compress(nestedConfig);
    expect(out).toContain('%0=host');
  });

  it('builds value dict for repeated values', () => {
    const out = compress(nestedConfig);
    expect(out).toContain('&0=production');
  });

  it('round-trips arrays of nested objects', () => {
    const data = [
      { order: 'ORD-1', customer: { name: 'Alice', country: 'US' }, status: 'shipped' },
      { order: 'ORD-2', customer: { name: 'Bob',   country: 'US' }, status: 'shipped' },
    ];
    expect(decompress(compress(data))).toEqual(data);
  });

  it('round-trips plain object', () => {
    const data = { glossary: { title: 'example glossary', GlossDiv: { title: 'S' } } };
    expect(decompress(compress(data))).toEqual(data);
  });

  it('round-trips arrays with mixed types', () => {
    const data = [1, 'hello', true, null, { key: 'val' }];
    expect(decompress(compress(data))).toEqual(data);
  });

  it('round-trips deeply nested structures', () => {
    const data = {
      a: { b: { c: { d: 'deep', e: 'deep' } } },
      x: { b: { c: { d: 'deep', e: 'deep' } } },
    };
    expect(decompress(compress(data))).toEqual(data);
  });

  it('handles objects without repeated keys (no dict)', () => {
    const data = { alpha: 1, beta: 2, gamma: 3 };
    expect(decompress(compress(data))).toEqual(data);
  });

  it('output is smaller than JSON.stringify for repeated keys', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      customer: { name: `User ${i}`, country: 'US' },
      payment: { currency: 'USD', status: 'settled' },
    }));
    const compressed = compress(data);
    expect(compressed.length).toBeLessThan(JSON.stringify(data).length);
  });

  it('round-trips numbers in nested objects', () => {
    const data = {
      prices: { apple: 1.99, banana: 0.49, cherry: 3.5 },
      totals: { apple: 1.99, banana: 0.49, cherry: 3.5 },
    };
    expect(decompress(compress(data))).toEqual(data);
  });

  it('round-trips boolean values', () => {
    const data = { a: { enabled: true, debug: false }, b: { enabled: true, debug: false } };
    expect(decompress(compress(data))).toEqual(data);
  });
});

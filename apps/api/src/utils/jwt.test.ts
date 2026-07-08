import { describe, expect, it } from 'vitest';
import { expiresInToDate } from './jwt.js';

describe('expiresInToDate', () => {
  it('adds minutes correctly', () => {
    const before = Date.now();
    const result = expiresInToDate('15m');
    const diff = result.getTime() - before;
    expect(diff).toBeGreaterThan(14 * 60_000);
    expect(diff).toBeLessThanOrEqual(15 * 60_000 + 1000);
  });

  it('adds days correctly', () => {
    const before = Date.now();
    const result = expiresInToDate('7d');
    const diff = result.getTime() - before;
    expect(diff).toBeGreaterThan(6.99 * 86_400_000);
  });

  it('throws on an invalid format', () => {
    expect(() => expiresInToDate('bogus')).toThrow();
  });
});

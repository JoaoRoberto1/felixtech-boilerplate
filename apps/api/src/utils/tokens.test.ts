import { describe, expect, it } from 'vitest';
import { generateOpaqueToken, hashToken } from './tokens.js';

describe('tokens', () => {
  it('generates a token whose hash matches hashToken(token)', () => {
    const { token, tokenHash } = generateOpaqueToken();
    expect(hashToken(token)).toBe(tokenHash);
  });

  it('generates unique tokens on each call', () => {
    const a = generateOpaqueToken();
    const b = generateOpaqueToken();
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).not.toBe(b.tokenHash);
  });

  it('never reveals the raw token via its hash', () => {
    const { token, tokenHash } = generateOpaqueToken();
    expect(tokenHash).not.toContain(token);
  });
});

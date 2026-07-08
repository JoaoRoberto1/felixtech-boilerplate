import { randomBytes, createHash } from 'node:crypto';

/**
 * Single-use tokens (password reset, email verification, invitations) are
 * generated as a random opaque string handed to the user, while only a
 * SHA-256 hash of it is persisted. This mirrors how we treat passwords:
 * a leaked database never reveals a usable token.
 */
export function generateOpaqueToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

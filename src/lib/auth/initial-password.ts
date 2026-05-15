import { randomInt } from 'node:crypto';

// Unambiguous character set (no 0/O/o/1/l/I) so users can transcribe accurately
// when the operator hands the password over to a vendor.
const ALPHABET =
  'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generates a random readable initial password (default 12 chars). */
export function generateInitialPassword(length = 12): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return out;
}

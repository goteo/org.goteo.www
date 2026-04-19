import murmur from 'murmurhash-js';

/**
 * murmurhash3 function
 *
 * Used for auto-generating component IDs.
 *
 * @param str - The string to hash
 * @param seed - Optional seed value (default: 0)
 * @returns A 32-bit numeric hash value
 */
export function murmur3(str: string, seed = 0): number {
  return murmur.murmur3(str, seed);
}
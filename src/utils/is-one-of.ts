/**
 * Check if `a` is one of `[...b]`
 */
export function isOneOf(a: any, b: any[] = []): boolean {
  return b.some(v => a === v);
}

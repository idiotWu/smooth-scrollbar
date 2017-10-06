export function valueWithin(value: number, min = -Infinity, max = Infinity): number {
  return Math.max(min, Math.min(max, value));
}

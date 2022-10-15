export function clamp(value: number, lower: number, upper: number): number {
  return Math.max(lower, Math.min(upper, value));
}

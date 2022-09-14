export function clamp(num: number, lower: number, upper: number) {
  num = +num;
  lower = +lower;
  upper = +upper;
  lower = lower === lower ? lower : 0;
  upper = upper === upper ? upper : 0;
  if (num === num) {
    num = num <= upper ? num : upper;
    num = num >= lower ? num : lower;
  }
  return num;
}

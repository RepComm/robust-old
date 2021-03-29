
export function _2dTo1d (x: number, y: number, width: number) {
  return x + width * y;
}
export function _1dTo2dX (index: number, width: number): number {
  return index % width;
}
export function _1dTo2dY (index: number, width: number): number {
  return index / width;
}
/**Linear interpolation between from and to, using 0.0 - 1.0 interpolant `by`*/
export const lerp = (from: number, to: number, by: number): number => {
  return from*(1-by)+to*by;
}
/**Performs the inverse of lerp
 * Will give you the interpolant given the interpolated number and its bounds (to and from)
 */
export const inverseLerp = (from: number, to: number, value: number): number => {
  return (value - from) / (to - from);
}

export function sign(value: number): number {
  return value < 0 ? -1 : 1;
}

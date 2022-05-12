export function _2dTo1d(x, y, width) {
  return x + width * y;
}
export function _1dTo2dX(index, width) {
  return index % width;
}
export function _1dTo2dY(index, width) {
  return index / width;
}
/**Linear interpolation between from and to, using 0.0 - 1.0 interpolant `by`*/

export const lerp = (from, to, by) => {
  return from * (1 - by) + to * by;
};
/**Performs the inverse of lerp
 * Will give you the interpolant given the interpolated number and its bounds (to and from)
 */

export const inverseLerp = (from, to, value) => {
  return (value - from) / (to - from);
};
export function sign(value) {
  return value < 0 ? -1 : 1;
}
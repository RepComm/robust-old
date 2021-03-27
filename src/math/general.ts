
export function _2dTo1d (x: number, y: number, width: number) {
  return x + width * y;
}
export function _1dTo2dX (index: number, width: number): number {
  return index % width;
}
export function _1dTo2dY (index: number, width: number): number {
  return index / width;
}


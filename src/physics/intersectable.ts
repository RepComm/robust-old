
import type { Vec2 } from "@repcomm/scenario2d";

export interface Intersectable {
  intersects (other: Intersectable, contactOut?: Vec2): boolean;
}

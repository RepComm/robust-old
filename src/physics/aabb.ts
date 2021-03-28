
import { Vec2 } from "@repcomm/scenario2d";
import { Intersectable } from "./intersectable";

export class AABB implements Intersectable {
  position: Vec2;
  halfExtents: Vec2;

  constructor () {
    this.position = new Vec2();
    this.halfExtents = new Vec2();
  }
  
  intersects(other: AABB, contactOut?: Vec2): boolean {
    return AABB.intersects(this.position, this.halfExtents, other.position, other.halfExtents, contactOut);
  }

  static intersects (aPos: Vec2, aHalfExtents: Vec2, bPos: Vec2, bHalfExtents: Vec2, contact: Vec2): boolean {
    if (Math.abs(aPos.x - bPos.x) > (aHalfExtents.x + bHalfExtents.x)) return false;
    if (Math.abs(aPos.y - bPos.y) > (aHalfExtents.y + bHalfExtents.y)) return false;
    //TODO - implement contact point
    return true;
  }
}



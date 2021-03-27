import { Vec2 } from "@repcomm/scenario2d";

export class AABB {
  static intersects (aPos: Vec2, aHalfExtents: Vec2, bPos: Vec2, bHalfExtents: Vec2, contact: Vec2): boolean {
    if (Math.abs(aPos.x - bPos.x) > (aHalfExtents.x + bHalfExtents.x)) return false;
    if (Math.abs(aPos.y - bPos.y) > (aHalfExtents.y + bHalfExtents.y)) return false;
    return true;
  }
}



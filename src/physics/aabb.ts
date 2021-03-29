
import { Vec2 } from "@repcomm/scenario2d";
import { Intersectable } from "./intersectable";
import { sign } from "../math/general";

export class AABB implements Intersectable {
  position: Vec2;
  halfExtents: Vec2;

  constructor() {
    this.position = new Vec2();
    this.halfExtents = new Vec2();
  }

  intersects(other: AABB, contactOut?: Vec2): boolean {
    return AABB.intersects(this.position, this.halfExtents, other.position, other.halfExtents, contactOut);
  }
  static extend (aabb: AABB, left: number, right: number, up: number, down: number) {
    if (left !== 0) {
      aabb.halfExtents.x += left/2;
      aabb.position.x -= left/2;
    }
    if (right !== 0) {
      aabb.halfExtents.x += right/2;
      aabb.position.x += right/2;
    }
    if (up !== 0) {
      aabb.halfExtents.y += up/2;
      aabb.position.y -= up/2;
    }
    if (down !== 0) {
      aabb.halfExtents.y += down/2;
      aabb.position.y += down/2;
    }
  }
  static intersects0(aPos: Vec2, aHalfExtents: Vec2, bPos: Vec2, bHalfExtents: Vec2, contact: Vec2): boolean {
    let xOverlap = true;
    let yOverlap = true;
    let anyOverlap = false;

    if (Math.abs(aPos.x - bPos.x) > (aHalfExtents.x + bHalfExtents.x)) xOverlap = false;
    if (Math.abs(aPos.y - bPos.y) > (aHalfExtents.y + bHalfExtents.y)) yOverlap = false;

    anyOverlap = xOverlap && yOverlap;

    //midpoint
    if (anyOverlap) contact.copy(aPos).lerp(bPos, 0.5);
    return anyOverlap;
  }
  static intersects(aPos: Vec2, aHalfExtents: Vec2, bPos: Vec2, bHalfExtents: Vec2, contact: Vec2): boolean {
    const dx = bPos.x - aPos.x;
    const px = (bHalfExtents.x + aHalfExtents.x) - Math.abs(dx);
    if (px <= 0) {
      return false;
    }

    const dy = bPos.y - aPos.y;
    const py = (bHalfExtents.y + aHalfExtents.y) - Math.abs(dy);
    if (py <= 0) {
      return false;
    }

    if (px < py) {
      const sx = sign(dx);
      // contact.delta.x = px * sx;
      // contact.normal.x = sx;
      contact.x = aPos.x + (aHalfExtents.x * sx);
      contact.y = bPos.y;
    } else {
      const sy = sign(dy);
      // contact.delta.y = py * sy;
      // contact.normal.y = sy;
      contact.x = bPos.x;
      contact.y = aPos.y + (aHalfExtents.y * sy);
    }
    return true;
  }
}

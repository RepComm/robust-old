import { Vec2 } from "@repcomm/scenario2d";
import { AABB } from "./aabb";
import { Intersectable } from "./intersectable";

export class BoxList implements Intersectable {
  private inactiveBoxes: Set<AABB>;
  boxes: Set<AABB>;

  constructor () {
    this.inactiveBoxes = new Set();
    this.boxes = new Set();
  }
  /**Test if an aabb intersects this box list*/
  intersects(other: AABB, contactOut?: Vec2): boolean {
    let result = false;

    for (let box of this.boxes) {
      if (box.intersects(other, contactOut)) {
        result = true;
        break;
      }
    }
    return result;
  }
  /**Get a box from the inactive set (recycled boxes)*/
  getInactiveBox (): AABB {
    let result = undefined;
    for (let box of this.inactiveBoxes) {
      result = box;
      break;
    }
    return result;
  }
  /**Instantiate a box*/
  createBox (): AABB {
    return new AABB();
  }
  /**Get or create a box*/
  acquireBox (): AABB {
    let result = this.getInactiveBox();
    if (!result) result = this.createBox();
    return result;
  }
  /**Sets a box to be activated (responsible for collision)*/
  setBoxActivated (box: AABB, activate: boolean = true): this {
    if (activate) {
      this.inactiveBoxes.delete(box);
      this.boxes.add(box);
    } else {
      this.boxes.delete(box);
      this.inactiveBoxes.add(box);
    }
    return this;
  }
  /**Make a collision at a specific aabb*/
  boxAt (x: number, y: number, w: number, h: number): AABB {
    let result = this.acquireBox();
    result.position.set(x, y);
    result.halfExtents.set(w/2, h/2);
    this.setBoxActivated(result);
    return result;
  }
  /**Recycle all collision*/
  clear (): this {
    for (let box of this.boxes) {
      this.setBoxActivated(box, false);
    }
    return this;
  }
  /**Get active box count*/
  getBoxCount (): number {
    return this.boxes.size;
  }
}

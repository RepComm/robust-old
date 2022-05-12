
import { Vec2 } from "@repcomm/scenario2d";
import { AABB } from "@repcomm/kissbb";
// import {  } from "@dimforge/rapier2d";

export class BoxList {
  offset: Vec2;
  private inactiveBoxes: Set<AABB>;
  boxes: Set<AABB>;

  private calcBoxOffset: Vec2;

  private placeHolder: Vec2;

  constructor () {
    this.inactiveBoxes = new Set();
    this.boxes = new Set();
    this.offset = new Vec2();
    this.calcBoxOffset = new Vec2();
    this.placeHolder = new Vec2();
  }

  /**Test if an aabb intersects this box list*/
  intersects(other: AABB, outNormal: Vec2): number {
    let result = false;
    let time = 1;

    for (let box of this.boxes) {
      //same as box.position, with overall offset of boxlist object
      this.calcBoxOffset.copy(box.position).add(this.offset);

      this.placeHolder.copy(box.position);

      box.position.copy(this.calcBoxOffset);
      time = AABB.sweep(other, box, outNormal);
      box.position.copy(this.placeHolder);
      if (time < 1.0) {
        return time;
      }
    }
    return 1;
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

    result.size.set(w, h);
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

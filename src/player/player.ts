
import { Vec2 } from "@repcomm/scenario2d";
import { AABB } from "../physics/aabb";
import { PhysicsObject2D } from "../physics/pobj";

export class Player extends PhysicsObject2D {
  aabb: AABB;
  debugDraw: boolean;
  contactPoint: Vec2;

  isOnGround: boolean;

  constructor() {
    super();
    this.aabb = new AABB();
    this.aabb.position = this.transform.position;
    this.aabb.halfExtents.set(0.25, 0.52);
    this.debugDraw = true;
    this.contactPoint = new Vec2();

    this.isOnGround = false;
  }

  render(ctx: CanvasRenderingContext2D): this {
    this.preRender(ctx);

    ctx.lineWidth = 0.05;

    if (this.isOnGround) {
      ctx.strokeStyle = "#ff0000";
    } else {
      ctx.strokeStyle = "#ffffff";
    }

    ctx.strokeRect(
      -this.aabb.halfExtents.x,
      -this.aabb.halfExtents.y,
      this.aabb.halfExtents.x*2,
      this.aabb.halfExtents.y*2
    );

    ctx.strokeRect(
      this.contactPoint.x - this.transform.position.x,
      this.contactPoint.y - this.transform.position.y,
      0.2,
      0.2
    );

    this.renderChildren(ctx);
    this.postRender(ctx);

    return this;
  }
}

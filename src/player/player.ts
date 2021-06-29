
import { Vec2 } from "@repcomm/scenario2d";
import { AABB } from "@repcomm/kissbb";
import { PhysicsObject2D } from "../physics/pobj";

export class Player extends PhysicsObject2D {
  aabb: AABB;
  debugDraw: boolean;
  contactPoint: Vec2;

  isOnGround: boolean;
  jumpDelay: number;
  jumpLast: number;

  constructor() {
    super();
    this.aabb = new AABB();
    this.aabb.position = this.transform.position;
    this.aabb.size.set(0.5, 1);
    this.debugDraw = true;
    this.contactPoint = new Vec2();

    this.isOnGround = false;
    this.slidingFriction = 0.1;
    this.jumpDelay = 400;
    this.jumpLast = 0;
  }

  render(ctx: CanvasRenderingContext2D): this {
    this.preRender(ctx);

    ctx.lineWidth = 0.05;

    ctx.strokeStyle = "#ffffff";

    if (this.isOnGround) {
      ctx.strokeStyle = "#ff0000";
    } else {
      ctx.strokeStyle = "#ffffff";
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.contactPoint.x, this.contactPoint.y);
    ctx.stroke();

    ctx.strokeRect(
      0,
      0,
      this.aabb.size.x,
      this.aabb.size.y
    );
    ctx.fillStyle = "white";
    ctx.font = `${0.5}px courier`;
    ctx.fillText(
      `${Math.floor(this.transform.position.x)}, ${Math.floor(this.transform.position.y)}`,
      this.aabb.size.x,
      this.aabb.size.y
    );

    this.renderChildren(ctx);
    this.postRender(ctx);

    return this;
  }
  canJump (): boolean {
    return Date.now() - this.jumpLast > this.jumpDelay;
  }
}

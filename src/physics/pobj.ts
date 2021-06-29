import { Object2D, Vec2 } from "@repcomm/scenario2d";

export class Physics {
  static SINGLETON: Physics;
  private objects: Set<PhysicsObject2D>;

  private deltaVector: Vec2;

  private gravity: Vec2;

  delta: number;

  private constructor () {
    this.objects = new Set();
    this.deltaVector = new Vec2();
    this.gravity = new Vec2();
    this.gravity.set(0, 0.098);
    this.delta = 0;
  }
  static get (): Physics {
    if (!Physics.SINGLETON) Physics.SINGLETON = new Physics();
    return Physics.SINGLETON;
  }
  step (delta: number): this {
    this.delta = delta;
    for (let object of this.objects) {
      if(!object.isDynamic) continue;

      //TODO - calculate collision physics

      //drag
      if (object.drag > 0) object.velocity.mulScalar(object.drag);

      this.deltaVector.copy(this.gravity);
      this.deltaVector.mulScalar(this.delta);

      //gravity
      object.velocity.add(this.deltaVector);

      //Account for delta time
      // this.deltaVector.copy(object.velocity);
      // this.deltaVector.mulScalar(delta);

      //velocity to object transform
      object.transform.position.add(object.velocity);
    }

    return this;
  }
  add (obj: PhysicsObject2D): this {
    this.objects.add(obj);
    return this;
  }
}

const physics = Physics.get();

export class PhysicsObject2D extends Object2D {
  isDynamic: boolean;
  velocity: Vec2;
  drag: number;
  slidingFriction: number;
  constructor () {
    super();
    this.velocity = new Vec2();
    this.isDynamic = true;
    this.drag = 0;
    this.slidingFriction = 0;
    physics.add(this);
  }
  setVelocity (vec: Vec2): this {
    this.velocity.copy(vec);
    return this;
  }
  getVelocity (out: Vec2): this {
    out.copy(this.velocity);
    return this;
  }
  addVelocity (vec: Vec2): this {
    this.velocity.add(vec);
    return this;
  }
}

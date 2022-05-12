import { Object2D, Vec2 } from "@repcomm/scenario2d"; // import { } from "@dimforge/rapier2d";

export class Physics {
  constructor() {
    this.objects = new Set();
    this.deltaVector = new Vec2();
    this.gravity = new Vec2();
    this.gravity.set(0, 0.098);
    this.delta = 0;
  }

  static get() {
    if (!Physics.SINGLETON) Physics.SINGLETON = new Physics();
    return Physics.SINGLETON;
  }

  step(delta) {
    this.delta = delta;

    for (let object of this.objects) {
      if (!object.isDynamic) continue; //TODO - calculate collision physics
      //drag

      if (object.drag > 0) object.velocity.mulScalar(object.drag);
      this.deltaVector.copy(this.gravity);
      this.deltaVector.mulScalar(this.delta); //gravity

      object.velocity.add(this.deltaVector); //Account for delta time
      // this.deltaVector.copy(object.velocity);
      // this.deltaVector.mulScalar(delta);
      //velocity to object transform

      object.transform.position.add(object.velocity);
    }

    return this;
  }

  add(obj) {
    this.objects.add(obj);
    return this;
  }

}
const physics = Physics.get();
export class PhysicsObject2D extends Object2D {
  constructor() {
    super();
    this.velocity = new Vec2();
    this.isDynamic = true;
    this.drag = 0;
    this.slidingFriction = 0;
    physics.add(this);
  }

  setVelocity(vec) {
    this.velocity.copy(vec);
    return this;
  }

  getVelocity(out) {
    out.copy(this.velocity);
    return this;
  }

  addVelocity(vec) {
    this.velocity.add(vec);
    return this;
  }

}
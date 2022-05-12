import { Track } from "../anim/anim.js";
export class Color {
  Color() {}

  static fromRGBA(r, g, b, a = 255) {
    let result = new Color();
    result.setRGBA(r, g, b, a);
    return result;
  }

  setRGBA(r, g, b, a = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    return this;
  }

  toString() {
    return `rgb(${this.r},${this.g},${this.b})`;
  }

}
export class ColorTrack extends Color {
  constructor() {
    super();
    this.rtrack = new Track();
    this.gtrack = new Track();
    this.btrack = new Track();
    this.atrack = new Track();
  }

  setAtTimeRGBA(time, r, g, b, a = 255) {
    this.rtrack.setValueAtTime(time, r);
    this.gtrack.setValueAtTime(time, g);
    this.btrack.setValueAtTime(time, b);
    this.atrack.setValueAtTime(time, a);
    return this;
  }

  render(time) {
    this.setRGBA(this.rtrack.getValueAtTime(time), this.gtrack.getValueAtTime(time), this.btrack.getValueAtTime(time), this.atrack.getValueAtTime(time));
  }

  get duration() {
    return this.rtrack.duration;
  }

}
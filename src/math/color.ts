import { Track } from "../anim/anim";

export class Color {
  r: number;
  g: number;
  b: number;
  a: number;
  private Color(){

  }
  static fromRGBA (r: number, g: number, b: number, a: number = 255): Color {
    let result = new Color();
    result.setRGBA(r,g,b,a);
    return result;
  }
  setRGBA (r: number, g: number, b: number, a: number = 255): this {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    return this;
  }
  toString (): string {
    return `rgb(${this.r},${this.g},${this.b})`;
  }
}

export class ColorTrack extends Color {
  rtrack: Track;
  gtrack: Track;
  btrack: Track;
  atrack: Track;
  constructor () {
    super();
    this.rtrack = new Track();
    this.gtrack = new Track();
    this.btrack = new Track();
    this.atrack = new Track();
  }
  setAtTimeRGBA (time: number, r: number, g: number, b: number, a: number = 255): this {
    this.rtrack.setValueAtTime(time, r);
    this.gtrack.setValueAtTime(time, g);
    this.btrack.setValueAtTime(time, b);
    this.atrack.setValueAtTime(time, a);
    return this;
  }
  render (time: number) {
    this.setRGBA(
      this.rtrack.getValueAtTime(time),
      this.gtrack.getValueAtTime(time),
      this.btrack.getValueAtTime(time),
      this.atrack.getValueAtTime(time)
    );
  }

  get duration (): number {
    return this.rtrack.duration;
  }
}

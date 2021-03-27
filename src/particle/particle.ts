import { Object2D, Vec2 } from "@repcomm/scenario2d";

export interface ParticleData {
  alive: boolean;
  timeStart: number;
  position: Vec2;
  velocity: Vec2;
}

export interface ParticleDraw {
  (ctx: CanvasRenderingContext2D, particle: ParticleData): void;
}

export interface ParticleSettings {
  lifespan: number;
  
  draw: ParticleDraw;

  rotationStart: number;
  rotationOverLifetime: number;
  
  scaleStart: number;
  scaleOverLifetime: number;

  speedStart: number;
  speedOverLifetime: number;
}

export class ParticleSystem extends Object2D {
  private particles: Array<ParticleData>;

  settings: ParticleSettings;

  private timeNow: number;

  private particleEnlapsed: number;
  private particleAlongLifespan: number;
  private particleScale: number;
  private particleVelocity: Vec2;

  private maxParticles: number;

  constructor () {
    super();
    this.particles = new Array();
    this.timeNow = 0;

    this.maxParticles = 50;

    this.settings = {
      draw:(ctx)=>{
        ctx.fillStyle = "white";
        ctx.fillRect(-0.5,-0.5,0.5,0.5);
      },
      lifespan: 500,
      rotationOverLifetime: 3,
      rotationStart: 0,
      scaleOverLifetime: -1,
      scaleStart: 1,
      speedOverLifetime: 0,
      speedStart: 0
    };

    this.particleVelocity = new Vec2();
  }
  spawnParticle (x: number, y: number, vx: number = 0, vy: number = 0): boolean {
    let selected: ParticleData;
    let first: ParticleData;

    for (let particle of this.particles) {
      if (!first) first = particle;
      if (!particle.alive) {
        selected = particle;
        break;
      }
    }
    if (!selected) {
      if (this.particles.length < this.maxParticles) {
        selected = {
          alive: true,
          position: new Vec2(),
          velocity: new Vec2(),
          timeStart: 0
        };
        this.particles.push(selected);
      }
    }
    if (!selected) selected = first;
    if (!selected) return false;

    selected.timeStart = Date.now();
    selected.alive = true;
    selected.position.set(x, y);
    selected.velocity.set(vx, vy);
    return true;
  }
  spawnParticleVecs (pos: Vec2, vel: Vec2): boolean {
    return this.spawnParticle(pos.x, pos.y, vel.x, vel.y);
  }
  render(ctx: CanvasRenderingContext2D): this {
    this.preRender(ctx);

    this.timeNow = Date.now();

    for (let particle of this.particles) {
      if (!particle.alive) continue;

      this.particleEnlapsed = this.timeNow - particle.timeStart;

      this.particleAlongLifespan = this.particleEnlapsed / this.settings.lifespan;

      if (this.particleAlongLifespan > 1) {
        particle.alive = false;
        continue;
      }

      ctx.save();
      ctx.translate(particle.position.x, particle.position.y);
      ctx.rotate(
        this.settings.rotationStart +
        (this.settings.rotationOverLifetime*this.particleAlongLifespan)
      );
      this.particleScale = this.settings.scaleStart +
      (this.settings.scaleOverLifetime*this.particleAlongLifespan);

      ctx.scale(this.particleScale, this.particleScale);
      
      this.particleVelocity.copy(particle.velocity);
      particle.position.add(this.particleVelocity);

      this.settings.draw(ctx, particle);

      ctx.restore();
    }

    this.postRender(ctx);

    return this;
  }
}
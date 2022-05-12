import { Object2D, Vec2 } from "@repcomm/scenario2d";

export interface ParticleData {
  alive: boolean;
  timeStart: number;
  position: Vec2;
  velocity: Vec2;
  meta: any;
}

export interface ParticleDraw {
  (ctx: CanvasRenderingContext2D, particle: ParticleData): void;
}

export interface ParticleSpawnGenerator {
  (ps: ParticleSystem)
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

  /**Spawn automatically - defaults to false, use spawnParticle()*/
  spawnAuto?: boolean;
  /**Number of particles spawned per spawn event*/
  spawnRate?: number;
  /**Time between spawn events*/
  spawnInterval?: number;
  /**A callback responsible for populating particles, called automatically*/
  spawnGenerator?: ParticleSpawnGenerator;
}

export class ParticleSystem extends Object2D {
  private enabled: boolean;
  private particles: Array<ParticleData>;

  settings: ParticleSettings;

  private timeNow: number;

  private particleEnlapsed: number;
  private particleAlongLifespan: number;
  private particleScale: number;
  private particleVelocity: Vec2;

  private maxParticles: number;

  //The last time auto spawn interval fired
  private autoSpawnLastTime: number;

  constructor () {
    super();
    this.enabled = true;
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
  isEnabled (): boolean {
    return this.enabled;
  }
  setEnabled (enabled: boolean = true): this {
    this.enabled = enabled;
    return this;
  }
  spawnParticle (x: number, y: number, vx: number = 0, vy: number = 0, meta: any = undefined): boolean {
    if (!this.enabled) return false;
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
          timeStart: 0,
          meta: undefined
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
    selected.meta = meta;
    return true;
  }
  spawnParticleVecs (pos: Vec2, vel: Vec2): boolean {
    return this.spawnParticle(pos.x, pos.y, vel.x, vel.y);
  }
  performAutoSpawn () {
    if (this.timeNow - this.autoSpawnLastTime < this.settings.spawnInterval) return;
    this.autoSpawnLastTime = this.timeNow;

    for (let i=0; i<this.settings.spawnRate; i++) {
      this.settings.spawnGenerator(this);
    }
  }
  render(ctx: CanvasRenderingContext2D): this {
    if (!this.enabled) return this;
    this.timeNow = Date.now();
    if (this.settings.spawnAuto) this.performAutoSpawn();
    this.preRender(ctx);


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

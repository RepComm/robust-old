
import { Object2D } from "@repcomm/scenario2d";
import { Block } from "./block";
import { Chunk } from "./chunk";
import { ParticleSettings, ParticleSystem } from "../particle/particle";

export interface WeatherMode {
  useParticles: boolean;
  particleSettings: ParticleSettings;
}

export class World extends Object2D {
  private chunks: Set<Chunk>;
  private inactiveChunks: Set<Chunk>;

  private generateBlock: Block;

  private psWeather: ParticleSystem;
  private weatherMode: WeatherMode;
  private weatherModes: Map<string, WeatherMode>;

  constructor () {
    super();
    this.chunks = new Set();
    this.inactiveChunks = new Set();
    this.generateBlock = new Block();

    this.psWeather = new ParticleSystem();
    this.add(this.psWeather);

    this.weatherModes = new Map();

    this.addWeatherMode("rainy", {
      useParticles: true,
      particleSettings: {
        draw: (ctx, particle)=>{
          ctx.fillStyle = "#313a4f";
          ctx.fillRect(0, 0, 0.05, 1.2);
        },
        lifespan: 1000,
        rotationOverLifetime: 0,
        rotationStart: 0.2,
        scaleOverLifetime: -0.2,
        scaleStart: 1,
        speedOverLifetime: 0,
        speedStart: 0,

        spawnAuto: true,
        spawnRate: 4,
        spawnInterval: 250,
        spawnGenerator: (ps)=>{
          ps.spawnParticle(
            Math.random()*32, 0,
            -0.1, 0.4+(Math.random()/3)
          );
        }
      }
    });

    this.addWeatherMode("snowy", {
      useParticles: true,
      particleSettings: {
        draw: (ctx, particle)=>{
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, 0.05, 0.05);
        },
        lifespan: 2000,
        rotationOverLifetime: 0.1,
        rotationStart: 0,
        scaleOverLifetime: -0.5,
        scaleStart: 1,
        speedOverLifetime: 0,
        speedStart: 0,

        spawnAuto: true,
        spawnRate: 8,
        spawnInterval: 250,
        spawnGenerator: (ps)=>{
          ps.spawnParticle(
            Math.random()*32, 0,
            0, 0.1+(Math.random()/4)
          );
        }
      }
    });

  }
  createChunk (): Chunk {
    let result = new Chunk();
    this.inactiveChunks.add(result);
    return result;
  }
  setChunkActivated (chunk: Chunk, activate: boolean = true): this {
    if (activate) {
      this.inactiveChunks.delete(chunk);
      this.chunks.add(chunk);
      this.add(chunk);
    } else {
      this.chunks.delete(chunk);
      this.inactiveChunks.add(chunk);
      this.remove(chunk);
    }
    return this;
  }
  getInactiveChunk (): Chunk {
    let result = undefined;
    for (let chunk of this.inactiveChunks) {
      result = chunk;
      break;
    }
    return result;
  }
  aquireChunk (): Chunk {
    let result = this.getInactiveChunk();
    if (!result) result = this.createChunk();
    return result;
  }
  generateChunk (chunk: Chunk): this {
    for (let x=0; x<Chunk.WIDTH; x++) {
      for (let y=0; y<Chunk.HEIGHT; y++) {
        if (y < 3) {
          this.generateBlock.type = 0;
        } else if (y === 3) {
          this.generateBlock.type = 3;
        } else if (y < 10) {
          this.generateBlock.type = 2;
        } else {
          this.generateBlock.type = 1;
        }
        chunk.setBlock(x, y, this.generateBlock);
      }
    }
    return this;
  }
  loadChunk (x: number, y: number): Chunk {
    let chunk = this.aquireChunk();
    chunk.setIndex(x, y);
    this.generateChunk(chunk);
    this.setChunkActivated(chunk);
    return chunk;
  }
  /**If chunk is not loaded, returns null
   * @param x 
   * @param y 
   * @returns chunk or null
   */
  getChunk (x: number, y: number): Chunk {
    for (let chunk of this.chunks) {
      if (chunk.getIndexX() === x && chunk.getIndexY() === y) return chunk;
    }
    return null;
  }
  /**Break a block in the world
   * If the chunk isn't loaded, nothing will happen
   * @param x 
   * @param y 
   * @returns true if successful, false if chunk wasn't loaded
   */
  breakBlock (x: number, y: number): boolean {
    let chunk = this.getChunk(
      Chunk.blockXToChunkIndexX(x),
      Chunk.blockYToChunkIndexY(y)
    );
    if (!chunk) return false;
    chunk.breakBlock(
      Chunk.blockWorldXToBlockChunkX(x),
      Chunk.blockWorldYToBlockChunkY(y)
    );
    return true;
  }
  clearWeather (): this {
    this.psWeather.setEnabled(false);
    this.weatherMode = undefined;
    return this;
  }
  setWeather (id: string, enabled: boolean = true): this {
    this.weatherMode = this.weatherModes.get(id);
    if (!this.weatherMode) return this;
    this.psWeather.settings = this.weatherMode.particleSettings;
    if (enabled) this.psWeather.setEnabled(true);
    return this;
  }
  addWeatherMode (id: string, mode: WeatherMode): this {
    this.weatherModes.set(id, mode);
    return this;
  }
}

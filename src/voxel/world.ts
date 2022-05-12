
import { Object2D } from "@repcomm/scenario2d";
import { Block } from "./block.js";
import { Chunk, getBlockColor } from "./chunk.js";
import { ParticleSettings, ParticleSystem } from "../particle/particle.js";
import { EventDispatcher, RobustEvent } from "../events/event.js";

const eventDispatcher = EventDispatcher.get();

export interface WorldBlockEvent extends RobustEvent {
  type: "block";
  world: World;
  chunk: Chunk;
  currentBlock: Block;
  previousBlock: Block;
}

export interface WeatherMode {
  useParticles: boolean;
  particleSettings: ParticleSettings;
}

export class World extends Object2D {
  chunks: Set<Chunk>;
  private inactiveChunks: Set<Chunk>;

  private generateBlock: Block;

  private psWeather: ParticleSystem;
  private weatherMode: WeatherMode;
  private weatherModes: Map<string, WeatherMode>;

  //TODO - replace will pool?
  private setBlockCurrent: Block;
  private setBlockPrevious: Block;
  private cachedChunk: Chunk;

  private psBlockSet: ParticleSystem;

  constructor () {
    super();
    this.chunks = new Set();
    this.inactiveChunks = new Set();
    this.generateBlock = new Block();

    this.setBlockPrevious = new Block();
    this.setBlockCurrent = new Block();

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

    this.psBlockSet = new ParticleSystem();
    this.psBlockSet.settings = {
      draw: (ctx, particle)=>{
        ctx.translate(-0.5, -0.5);
        ctx.fillStyle = getBlockColor(particle.meta||-1);
        ctx.fillRect(0, 0, 1, 1);
      },
      lifespan: 400,
      rotationOverLifetime: 0.2,
      rotationStart: 0,
      scaleOverLifetime: -1,
      scaleStart: 1,
      speedOverLifetime: 0,
      speedStart: 0
    };
    this.add(this.psBlockSet);
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
        // if (Math.random() > 0.5) {
        //   this.generateBlock.type = 1;
        // } else {
        //   this.generateBlock.type = 0;
        // }
        chunk.setBlock(x, y, this.generateBlock);
      }
    }
    chunk.calculateCollision();
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
  /**Same as getChunk, but it puts the chunk reference into cachedChunk internal var
   * Returns true if chunk is loaded
   * @param x 
   * @param y 
   * @returns 
   */
  cacheChunk (x: number, y: number): boolean {
    this.cachedChunk = this.getChunk(
      Chunk.blockXToChunkIndexX(x),
      Chunk.blockYToChunkIndexY(y)
    );
    return this.cachedChunk !== undefined && this.cachedChunk !== null;
  }
  getCachedChunk (): Chunk {
    return this.cachedChunk;
  }
  /**Break a block in the world
   * Returns false if cancelled or otherwise could not set block
   * @param x 
   * @param y 
   * @returns true if successful
   */
  breakBlock (x: number, y: number): boolean {
    this.setBlockCurrent.type = 0;
    return this.setBlock(x, y, this.setBlockCurrent);
  }
  /**Gets a block from loaded chunks, puts data into `out` block
   * Returns true if successful, false if chunk not loaded
   * @param x 
   * @param y 
   * @param out 
   */
  getBlock (x: number, y: number, out: Block): boolean {
    if (!this.cacheChunk(x, y)) return false;
    this.cachedChunk.getBlock(
      Chunk.blockWorldXToBlockChunkX(x),
      Chunk.blockWorldYToBlockChunkY(y),
      out
    );
    out.worldX = x;
    out.worldY = y;
    return true;
  }
  /**Returns false if cancelled or otherwise couldn't set block*/
  setBlock (x: number, y: number, block: Block, doEvent: boolean = true, doParticle: boolean = true, recalcCollision: boolean = true): boolean {
    this.setBlockCurrent.copy(block);

    if (!this.getBlock(x, y, this.setBlockPrevious)) return false;
    
    //If blocks are the same, don't do all that processing..
    if (this.setBlockPrevious.equalsBlockData(block)) return false;

    if (doEvent) {
      if (eventDispatcher.fire({
        type: "block",
        currentBlock: this.setBlockCurrent,
        previousBlock: this.setBlockPrevious
      } as WorldBlockEvent)) {
        return false; //cancel
      }
    }

    //Use index method as it is most efficient
    this.cachedChunk.setBlockFromIndex(this.setBlockPrevious.index, this.setBlockCurrent);

    if (doParticle) {
      //Play particle
      this.psBlockSet.spawnParticle(
        x+0.5,
        y+0.5,
        0, 0, this.setBlockPrevious.type
      );
    }
    
    if (recalcCollision) this.cachedChunk.calculateCollision();
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

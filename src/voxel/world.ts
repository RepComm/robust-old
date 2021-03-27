import { Object2D } from "@repcomm/scenario2d";
import { Block } from "./block";
import { Chunk } from "./chunk";

export class World extends Object2D {
  private chunks: Set<Chunk>;
  private inactiveChunks: Set<Chunk>;

  private generateBlock: Block;

  constructor () {
    super();
    this.chunks = new Set();
    this.inactiveChunks = new Set();
    this.generateBlock = new Block();
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
}

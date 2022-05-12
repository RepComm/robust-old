import { Object2D, Vec2 } from "@repcomm/scenario2d";
import { Block } from "./block.js";
import { _1dTo2dX, _1dTo2dY, _2dTo1d } from "../math/general.js";
import { BoxList } from "../physics/boxlist.js";
import { AABB } from "@repcomm/kissbb";

function randomColor() {
  let str = Math.floor(Math.random() * 0xffffffff).toString(16);
  let zeroes = 8 - str.length;

  for (let i = 0; i < zeroes; i++) {
    str = "0" + str;
  }

  return "#" + str;
}

export function getBlockColor(type) {
  switch (type) {
    case 1:
      //stone
      return "#222223";

    case 2:
      //dirt
      return "#553322";

    case 3:
      //grass
      return "#44dd55";

    default:
      return "#ff7744";
  }
}
export class Chunk extends Object2D {
  constructor() {
    super();
    this.boxlist = new BoxList();
    this.data = new Uint8Array(Chunk.WIDTH * Chunk.HEIGHT * Chunk.BYTES_PER_BLOCK);
    this.renderBlock = new Block();
    this.collisionBlock = new Block();
    this.debugCollision = true;
    this.debugCollisionVec = new Vec2();
  }

  static getBlockIndex(x, y) {
    return _2dTo1d(x, y, Chunk.WIDTH);
  }

  static getBlockX(blockIndex) {
    return _1dTo2dX(blockIndex, Chunk.WIDTH);
  }

  static getBlockY(blockIndex) {
    return _1dTo2dY(blockIndex, Chunk.WIDTH);
  }

  static isBlockIndexValid(index) {
    return index > -1 && index < Chunk.WIDTH * Chunk.HEIGHT;
  }

  static isBlockXYValid(x, y) {
    return x > -1 && x < Chunk.WIDTH && y > -1 && y < Chunk.HEIGHT;
  }

  static blockXToChunkIndexX(x) {
    return Math.floor(x / Chunk.WIDTH);
  }

  static blockYToChunkIndexY(y) {
    return Math.floor(y / Chunk.HEIGHT);
  }

  static blockWorldXToBlockChunkX(x) {
    return x % Chunk.WIDTH;
  }

  static blockWorldYToBlockChunkY(y) {
    return y % Chunk.HEIGHT;
  }

  setIndex(x, y) {
    this.indexX = x;
    this.indexY = y;
    this.transform.position.set(x * Chunk.WIDTH, y * Chunk.HEIGHT);
    this.boxlist.offset.copy(this.transform.position); // this.boxlist.offset.x += 0.5;
    // this.boxlist.offset.y += 0.5;

    return this;
  }

  getIndexX() {
    return this.indexX;
  }

  getIndexY() {
    return this.indexY;
  }

  getBlock(localX, localY, out) {
    this.getBlockFromIndex(Chunk.getBlockIndex(localX, localY), out);
    out.chunkX = localX;
    out.chunkY = localY;
  }
  /**Writes only type, and index to `out`
   * @param index 
   * @param out 
   */


  getBlockFromIndex(index, out) {
    out.type = this.data[index * Chunk.BYTES_PER_BLOCK]; //TODO - add other material data here

    out.index = index;
  }

  breakBlock(localX, localY) {
    this.renderBlock.type = 0;
    this.setBlock(localX, localY, this.renderBlock);
  }

  setBlock(localX, localY, block) {
    this.setBlockFromIndex(Chunk.getBlockIndex(localX, localY), block);
  }

  setBlockFromIndex(index, block) {
    this.data[index * Chunk.BYTES_PER_BLOCK] = block.type;
  }

  render(ctx) {
    this.preRender(ctx);
    let idx = 0;

    for (let x = 0; x < Chunk.WIDTH; x++) {
      for (let y = 0; y < Chunk.HEIGHT; y++) {
        //get the current block
        idx = Chunk.getBlockIndex(x, y);
        this.getBlockFromIndex(idx, this.renderBlock); //dont render air

        if (this.renderBlock.type === 0) continue;
        ctx.fillStyle = getBlockColor(this.renderBlock.type);
        ctx.fillRect(x, y, 1, 1);
      }
    }

    if (this.debugCollision) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.01;

      for (let box of this.boxlist.boxes) {
        ctx.strokeRect(box.position.x, box.position.y, box.size.x, box.size.y);
      }
    }

    this.renderChildren(ctx);
    this.postRender(ctx);
    return this;
  }

  calculateCollision() {
    //reset collision
    this.boxlist.clear();
    let box;

    for (let x = 0; x < Chunk.WIDTH; x++) {
      for (let y = 0; y < Chunk.HEIGHT; y++) {
        //calculate current block
        this.getBlock(x, y, this.collisionBlock); //If this block has collision

        if (this.collisionBlock.type !== 0) {
          //If we need a separate collision box
          if (!box) {
            box = this.boxlist.boxAt(x, y, 1, 1);
          } else {
            //otherwise extend the last one (it gets reset for blocks with no collision)
            // box.halfExtents.y += 0.5;
            AABB.extend(box, 0, 0, 0, 1);
          } //If the block has no collision

        } else {
          //reset box so we'll need a new one in future in this column
          box = undefined;
        }
      } //reset block at end


      box = undefined;
    } // console.log(this.boxlist.getBoxCount(), "boxes");

  }

}
Chunk.WIDTH = 16;
Chunk.HEIGHT = 16;
Chunk.BYTES_PER_BLOCK = 1;
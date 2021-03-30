
import { Object2D, Vec2 } from "@repcomm/scenario2d";
import { Block } from "./block";
import { _1dTo2dX, _1dTo2dY, _2dTo1d } from "../math/general";

import { Intersectable } from "../physics/intersectable";
import { BoxList } from "../physics/boxlist";
import { AABB } from "../physics/aabb";

function randomColor(): string {
  let str = Math.floor(Math.random() * 0xffffffff).toString(16);

  let zeroes = (8 - str.length);
  for (let i = 0; i < zeroes; i++) {
    str = "0" + str;
  }

  return "#" + str;
}

export function getBlockColor(type: number): string {
  switch (type) {
    case 1: //stone
      return "#222223";
    case 2: //dirt
      return "#553322";
    case 3: //grass
      return "#44dd55";
    default:
      return "#ff7744";
  }
}

export class Chunk extends Object2D {
  static WIDTH: number;
  static HEIGHT: number;
  static BYTES_PER_BLOCK: number;

  private data: Uint8Array;
  private renderBlock: Block;
  private collisionBlock: Block;
  private indexX: number;
  private indexY: number;

  boxlist: BoxList;
  private debugCollision: boolean;
  private debugCollisionVec: Vec2;

  constructor() {
    super();
    this.boxlist = new BoxList();
    
    this.data = new Uint8Array(
      Chunk.WIDTH *
      Chunk.HEIGHT *
      Chunk.BYTES_PER_BLOCK
      );
      
    this.renderBlock = new Block();
    this.collisionBlock = new Block();
    this.debugCollision = false;
    this.debugCollisionVec = new Vec2();  
  }
  static getBlockIndex(x: number, y: number): number {
    return _2dTo1d(x, y, Chunk.WIDTH);
  }
  static getBlockX(blockIndex: number): number {
    return _1dTo2dX(blockIndex, Chunk.WIDTH);
  }
  static getBlockY(blockIndex: number): number {
    return _1dTo2dY(blockIndex, Chunk.WIDTH);
  }
  static isBlockIndexValid(index: number): boolean {
    return index > -1 && index < Chunk.WIDTH * Chunk.HEIGHT;
  }
  static isBlockXYValid(x: number, y: number): boolean {
    return (
      x > -1 &&
      x < Chunk.WIDTH &&
      y > -1 &&
      y < Chunk.HEIGHT
    );
  }
  static blockXToChunkIndexX(x: number): number {
    return Math.floor(x / Chunk.WIDTH);
  }
  static blockYToChunkIndexY(y: number): number {
    return Math.floor(y / Chunk.HEIGHT);
  }
  static blockWorldXToBlockChunkX(x: number): number {
    return x % Chunk.WIDTH;
  }
  static blockWorldYToBlockChunkY(y: number): number {
    return y % Chunk.HEIGHT;
  }
  setIndex(x: number, y: number): this {
    this.indexX = x;
    this.indexY = y;
    this.transform.position.set(
      x * Chunk.WIDTH,
      y * Chunk.HEIGHT
    );
    this.boxlist.offset.copy(this.transform.position);
    // this.boxlist.offset.x += 0.5;
    // this.boxlist.offset.y += 0.5;
    return this;
  }
  getIndexX(): number {
    return this.indexX;
  }
  getIndexY(): number {
    return this.indexY;
  }
  getBlock(localX: number, localY: number, out: Block) {
    this.getBlockFromIndex(
      Chunk.getBlockIndex(localX, localY),
      out
    );
    out.chunkX = localX;
    out.chunkY = localY;
  }
  /**Writes only type, and index to `out`
   * @param index 
   * @param out 
   */
  getBlockFromIndex(index: number, out: Block) {
    out.type = this.data[index * Chunk.BYTES_PER_BLOCK];
    //TODO - add other material data here
    out.index = index;
  }
  breakBlock(localX: number, localY: number) {
    this.renderBlock.type = 0;
    this.setBlock(localX, localY, this.renderBlock);
  }
  setBlock(localX: number, localY: number, block: Block) {
    this.setBlockFromIndex(Chunk.getBlockIndex(localX, localY), block);
  }
  setBlockFromIndex(index: number, block: Block) {
    this.data[index * Chunk.BYTES_PER_BLOCK] = block.type;
  }
  render(ctx: CanvasRenderingContext2D): this {
    this.preRender(ctx);

    let idx = 0;

    for (let x = 0; x < Chunk.WIDTH; x++) {
      for (let y = 0; y < Chunk.HEIGHT; y++) {
        //get the current block
        idx = Chunk.getBlockIndex(x, y);
        this.getBlockFromIndex(idx, this.renderBlock);

        //dont render air
        if (this.renderBlock.type === 0) continue;

        ctx.fillStyle = getBlockColor(this.renderBlock.type);
        ctx.fillRect(x, y, 1, 1);
      }
    }

    if (this.debugCollision) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.01;
      for (let box of this.boxlist.boxes) {

        ctx.strokeRect(
          box.position.x-box.halfExtents.x,
          box.position.y-box.halfExtents.y,
          box.halfExtents.x * 2,
          box.halfExtents.y * 2
        );
      }
    }

    this.renderChildren(ctx);
    this.postRender(ctx);

    return this;
  }
  calculateCollision() {
    //reset collision
    this.boxlist.clear();

    let box: AABB;

    for (let x = 0; x < Chunk.WIDTH; x++) {
      for (let y = 0; y < Chunk.HEIGHT; y++) {
        //calculate current block
        this.getBlock(x, y, this.collisionBlock);

        //If this block has collision
        if (this.collisionBlock.type !== 0) {
          //If we need a separate collision box
          if (!box) {
            box = this.boxlist.boxAt(x+0.5, y+0.5, 1, 1);
          } else {
            //otherwise extend the last one (it gets reset for blocks with no collision)
            // box.halfExtents.y += 0.5;
            AABB.extend(box, 0, 0, 0, 1);
          }
          //If the block has no collision
        } else {
          //reset box so we'll need a new one in future in this column
          box = undefined;
        }
      }
      //reset block at end
      box = undefined;
    }

    // console.log(this.boxlist.getBoxCount(), "boxes");
  }
}
Chunk.WIDTH = 16;
Chunk.HEIGHT = 16;
Chunk.BYTES_PER_BLOCK = 1;

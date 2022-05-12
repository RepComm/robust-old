
export class Block {
  /**The block x in the world*/
  worldX: number;
  /**The block y in the world*/
  worldY: number;
  /**The block x in the chunk*/
  chunkX: number;
  /**The block y in the chunk*/
  chunkY: number;
  /**The block index in the chunk*/
  index: number;
  
  /**The block's type*/
  type: number;
  /**Background blocks have no collision and are rendered with a tint*/
  background: boolean;

  constructor () {
    this.type = 0;
    this.background = false;
  }
  copy (from: Block): this {
    this.worldX = from.worldX;
    this.worldY = from.worldY;
    this.chunkX = from.chunkX;
    this.chunkY = from.chunkY;
    this.type = from.type;
    this.background = from.background;
    return this;
  }
  copyBlockData (from: Block): this {
    this.type = from.type;
    this.background = from.background;
    return this;
  }
  equalsBlockData (other: Block): boolean {
    return (this.type === other.type);
  }
}

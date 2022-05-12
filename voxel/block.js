export class Block {
  /**The block x in the world*/

  /**The block y in the world*/

  /**The block x in the chunk*/

  /**The block y in the chunk*/

  /**The block index in the chunk*/

  /**The block's type*/

  /**Background blocks have no collision and are rendered with a tint*/
  constructor() {
    this.type = 0;
    this.background = false;
  }

  copy(from) {
    this.worldX = from.worldX;
    this.worldY = from.worldY;
    this.chunkX = from.chunkX;
    this.chunkY = from.chunkY;
    this.type = from.type;
    this.background = from.background;
    return this;
  }

  copyBlockData(from) {
    this.type = from.type;
    this.background = from.background;
    return this;
  }

  equalsBlockData(other) {
    return this.type === other.type;
  }

}
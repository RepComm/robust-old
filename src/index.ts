
import { runOnce, EXPONENT_CSS_STYLES, Drawing, Panel, get } from "@repcomm/exponent-ts";
import { GameInput } from "@repcomm/gameinput-ts";

import { Scene2D, Vec2 } from "@repcomm/scenario2d";
import { ParticleSystem } from "./particle/particle";
import { Block } from "./voxel/block";
import { Chunk, getBlockColor } from "./voxel/chunk";
import { World } from "./voxel/world";

runOnce();

EXPONENT_CSS_STYLES.mount(document.head);

const body = new Panel()
.useNative(document.body)
.applyRootClasses()
.setStyleItem("position", "absolute")
.setStyleItem("margin", "0")
.setStyleItem("padding", 0)
.setStyleItem("width", "100vw")
.setStyleItem("height", "100vh")
.setStyleItem("overflow", "hidden")
.setStyleItem("display", "flex");

const container = new Panel()
.setId("container")
.mount(document.body);

const renderer = new Drawing({alpha: false})
.setId("canvas")
.setHandlesResize(true)
.setStyleItem("cursor", "url(\"./textures/crosshair_0.svg\"), auto")
.mount(container);

const input = GameInput.get();
function setupInput () {
  input.createAxis("walk")
  .addInfluence({
    keys: ["a"],
    value: -1
  }).addInfluence({
    keys: ["d"],
    value: 1
  });
  input.createButton("jump")
  .addInfluence({
    keys: [" "]
  });
  input.createButton("break")
  .addInfluence({
    mouseButtons: [0]
  });
}
setupInput();

const BLOCK_SIZE_PX = 32;

const scene = new Scene2D();

scene.getTransform().scale = BLOCK_SIZE_PX;

const world = new World();
world.loadChunk(0, 0);
world.loadChunk(1, 0);

scene.add(world);

let psBreakBlock = new ParticleSystem();
psBreakBlock.settings = {
  draw: (ctx, particle)=>{
    ctx.translate(-0.5, -0.5);
    ctx.fillStyle = getBlockColor(particle.meta||-1);
    ctx.fillRect(0, 0, 1, 1);
  },
  lifespan: 250,
  rotationOverLifetime: 0,
  rotationStart: 0,
  scaleOverLifetime: -0.5,
  scaleStart: 1,
  speedOverLifetime: 0,
  speedStart: 0
};
scene.add(psBreakBlock);

const renderMouseVec = new Vec2();
function calculateRenderMouseVec () {
  renderMouseVec.set(
    input.raw.getPointerX(),
    input.raw.getPointerY()
  );
  renderMouseVec.divScalar(scene.transform.scale);
}

const breakBlockCoords = new Vec2();

renderer.addRenderPass((ctx, drawing)=>{
  scene.render(ctx);
  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(0, 0, drawing.width, drawing.height);

  calculateRenderMouseVec();

  if (input.getButtonValue("break")) {
    breakBlockCoords.set(
      Math.floor(renderMouseVec.x),
      Math.floor(renderMouseVec.y)
    );

    psBreakBlock.spawnParticle(
      breakBlockCoords.x+0.5,
      breakBlockCoords.y+0.5,
      0, 0, 1
    );

    world.breakBlock(
      breakBlockCoords.x,
      breakBlockCoords.y
    );
  }
});

setInterval(()=>{
  renderer.setNeedsRedraw();
}, 1000/15);


import { runOnce, EXPONENT_CSS_STYLES, Drawing, Panel, get } from "@repcomm/exponent-ts";

import { Scene2D } from "@repcomm/scenario2d";
import { ParticleSystem } from "./particle/particle";
import { Block } from "./voxel/block";
import { Chunk } from "./voxel/chunk";
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
.mount(container);

const BLOCK_SIZE_PX = 32;

const scene = new Scene2D();

scene.getTransform().scale = BLOCK_SIZE_PX;

const world = new World();
world.loadChunk(0, 0);
world.loadChunk(1, 0);

scene.add(world);

let ps = new ParticleSystem();
ps.getTransform().position.set(12, 6);
ps.settings.lifespan = 2000;
scene.add(ps);
console.log(ps);

setInterval(()=>{
  for (let i=0; i<25; i++) {
    ps.spawnParticle(
      0,
      0,
      Math.random()*2-1,
      Math.random()*2-1
    );
  }
}, 2000);

renderer.addRenderPass((ctx, drawing)=>{
  scene.render(ctx);
  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(0, 0, drawing.width, drawing.height);
});

setInterval(()=>{
  renderer.setNeedsRedraw();
}, 1000/15);

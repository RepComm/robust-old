
import { runOnce, EXPONENT_CSS_STYLES, Drawing, Panel, get } from "@repcomm/exponent-ts";
import { GameInput } from "@repcomm/gameinput-ts";

import { Scene2D, Vec2 } from "@repcomm/scenario2d";
import { ParticleSystem } from "./particle/particle";
import { Block } from "./voxel/block";
import { Chunk, getBlockColor } from "./voxel/chunk";
import { World, WorldBlockEvent } from "./voxel/world";

import { Track } from "./anim/anim";
import { ColorTrack } from "./math/color";
import { EventDispatcher } from "./events/event";

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

const eventDispatcher = EventDispatcher.get();
// eventDispatcher.listen("block", (evt: WorldBlockEvent)=> {
//   // console.log("[Block]", evt);
//   if (Math.random() > 0.5) return true;
// });

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

world.setWeather("rainy", true);

const renderMouseVec = new Vec2();
function calculateRenderMouseVec () {
  renderMouseVec.set(
    input.raw.getPointerX(),
    input.raw.getPointerY()
  );
  renderMouseVec.divScalar(scene.transform.scale);
}

const skyColorDelay = 20000;
const skyColorTrack = new ColorTrack();
skyColorTrack.setAtTimeRGBA(0*skyColorDelay, 50, 53, 66);
skyColorTrack.setAtTimeRGBA(1*skyColorDelay, 71, 78, 100);
skyColorTrack.setAtTimeRGBA(2*skyColorDelay, 32, 22, 28);
skyColorTrack.setAtTimeRGBA(3*skyColorDelay, 50, 53, 66);

const breakBlockCoords = new Vec2();

renderer.addRenderPass((ctx, drawing)=>{
  skyColorTrack.render(Date.now()%skyColorTrack.duration);

  ctx.fillStyle = skyColorTrack.toString();
  ctx.fillRect(0, 0, drawing.width, drawing.height);
  
  scene.render(ctx);

  calculateRenderMouseVec();

  if (input.getButtonValue("break")) {
    breakBlockCoords.set(
      Math.floor(renderMouseVec.x),
      Math.floor(renderMouseVec.y)
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

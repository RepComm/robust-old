
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
import { Player } from "./player/player";

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
  input.createAxis("horizontal")
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
  input.createAxis("vertical")
  .addInfluence({
    keys: ["w"],
    value: 1
  })
  .addInfluence({
    keys: ["s"],
    value: -1
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
world.loadChunk(1, 0);
// world.loadChunk(1, 0);

scene.add(world);

world.setWeather("rainy", true);

const player = new Player();
player.transform.position.set(6, 6);
scene.add(player);

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

const mouseBlockCoords = new Vec2();
const playerMoveVec = new Vec2();
const playerMoveSpeed = 0.2;
const mouseRadius = 4;
renderer.addRenderPass((ctx, drawing)=>{
  skyColorTrack.render(Date.now()%skyColorTrack.duration);

  ctx.fillStyle = skyColorTrack.toString();
  ctx.fillRect(0, 0, drawing.width, drawing.height);
  
  scene.render(ctx);

  playerMoveVec.set(
    input.getAxisValue("horizontal")*playerMoveSpeed,
    input.getAxisValue("vertical")*-playerMoveSpeed
  );

  player.transform.position.add(playerMoveVec);

  for (let chunk of world.chunks) {
    player.isOnGround = chunk.boxlist.intersects(player.aabb, player.contactPoint);
    if (player.isOnGround){
      // console.log(player.transform.position.x, player.transform.position.y);
      break;
    }
  }

  calculateRenderMouseVec();

  if (input.getButtonValue("break")) {
    mouseBlockCoords.set(
      Math.floor(renderMouseVec.x),
      Math.floor(renderMouseVec.y)
    );
    
    for (let lx=0; lx<mouseRadius; lx++) {
      for (let ly=0; ly<mouseRadius; ly++) {
        world.breakBlock(
          Math.floor(mouseBlockCoords.x + lx - (mouseRadius/2)),
          Math.floor(mouseBlockCoords.y + ly - (mouseRadius/2))
        );
      }
    }
    
  }
});

setInterval(()=>{
  renderer.setNeedsRedraw();
}, 1000/15);

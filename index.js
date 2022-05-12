import { Drawing, EXPONENT_CSS_BODY_STYLES, EXPONENT_CSS_STYLES, Panel } from "@repcomm/exponent-ts";
import { GameInput } from "@repcomm/gameinput-ts";
import { Scene2D, Vec2 } from "@repcomm/scenario2d";
import { EventDispatcher } from "./events/event.js";
import { ColorTrack } from "./math/color.js";
import { Physics } from "./physics/pobj.js";
import { Player } from "./player/player.js";
import { World } from "./voxel/world.js";
EXPONENT_CSS_BODY_STYLES.mount(document.head);
EXPONENT_CSS_STYLES.mount(document.head);
const container = new Panel().setId("container").mount(document.body);
const eventDispatcher = EventDispatcher.get(); // eventDispatcher.listen("block", (evt: WorldBlockEvent)=> {
//   // console.log("[Block]", evt);
//   if (Math.random() > 0.5) return true;
// });

const renderer = new Drawing({
  alpha: false
}).setId("canvas").setHandlesResize(true).setStyleItem("cursor", `url("./textures/crosshair_0.svg"), auto`).mount(container);
const input = GameInput.get();

function setupInput() {
  input.getOrCreateAxis("horizontal").addInfluence({
    keys: ["a"],
    value: -1
  }).addInfluence({
    keys: ["d"],
    value: 1
  });
  input.getOrCreateAxis("jump").addInfluence({
    value: 1,
    keys: [" "]
  });
  input.getOrCreateAxis("vertical").addInfluence({
    keys: ["w"],
    value: 1
  }).addInfluence({
    keys: ["s"],
    value: -1
  });
  input.getOrCreateButton("break").addInfluence({
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
const player = new Player();
player.transform.position.set(6, 0);
scene.add(player);
const skyColorDelay = 20000;
const skyColorTrack = new ColorTrack();
skyColorTrack.setAtTimeRGBA(0 * skyColorDelay, 50, 53, 66);
skyColorTrack.setAtTimeRGBA(1 * skyColorDelay, 71, 78, 100);
skyColorTrack.setAtTimeRGBA(2 * skyColorDelay, 32, 22, 28);
skyColorTrack.setAtTimeRGBA(3 * skyColorDelay, 50, 53, 66);
const mouseBlockCoords = new Vec2();
const playerMoveVec = new Vec2();
const playerMoveSpeed = 0.2;
const mouseRadius = 4;
const sceneCameraOffset = new Vec2();
const renderMouseVec = new Vec2();

function calculateRenderMouseVec() {
  renderMouseVec.set(input.raw.getPointerX(), input.raw.getPointerY()).sub(sceneCameraOffset);
  renderMouseVec.divScalar(scene.transform.scale);
}

renderer.addRenderPass((ctx, drawing) => {
  sceneCameraOffset.copy(player.transform.position).mulScalar(-BLOCK_SIZE_PX);
  sceneCameraOffset.x += drawing.width / 2;
  sceneCameraOffset.y += drawing.height / 2;
  scene.transform.position.copy(sceneCameraOffset);
  skyColorTrack.render(Date.now() % skyColorTrack.duration);
  ctx.fillStyle = skyColorTrack.toString();
  ctx.fillRect(0, 0, drawing.width, drawing.height);
  console.log(scene);
  scene.render(ctx);
  playerMoveVec.set(input.getAxisValue("horizontal") * playerMoveSpeed, 0);
  playerMoveVec.mulScalar(Physics.SINGLETON.delta);
  player.addVelocity(playerMoveVec);
  player.aabb.position.copy(player.transform.position);
  player.aabb.velocity.copy(player.velocity);
  let dotprod = 0;
  let collisiontime = 1;
  let remainingtime = 0;

  for (let chunk of world.chunks) {
    collisiontime = chunk.boxlist.intersects(player.aabb, player.contactPoint);
    remainingtime = 1.0 - collisiontime;
    player.isOnGround = collisiontime < 1;

    if (player.isOnGround) {
      if (player.canJump() && input.getAxisValue("vertical") > 0.1) {
        playerMoveVec.set(0, -10);
        playerMoveVec.mulScalar(Physics.SINGLETON.delta);
        player.addVelocity(playerMoveVec);
        player.jumpLast = Date.now();
      }

      dotprod = (player.velocity.x * player.contactPoint.y + player.velocity.y * player.contactPoint.x) * remainingtime;
      player.velocity.set(dotprod * player.contactPoint.y, dotprod * player.contactPoint.x);
      break;
    }
  }

  calculateRenderMouseVec();

  if (input.getButtonValue("break")) {
    mouseBlockCoords.set(Math.floor(renderMouseVec.x), Math.floor(renderMouseVec.y));

    for (let lx = 0; lx < mouseRadius; lx++) {
      for (let ly = 0; ly < mouseRadius; ly++) {
        world.breakBlock(Math.floor(mouseBlockCoords.x + lx - mouseRadius / 2), Math.floor(mouseBlockCoords.y + ly - mouseRadius / 2));
      }
    }
  }
});
const physics = Physics.get();
const fps = 60; //15;

setInterval(() => {
  physics.step(1 / fps);
  renderer.setNeedsRedraw();
}, 1000 / fps);
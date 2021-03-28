
import type { Block } from "../voxel/block";
import type { Chunk } from "../voxel/chunk";
import type { World } from "../voxel/world";

export interface RobustEvent {
  type: string;
}

/**An event listener
 * Return true from this callback if you wish to cancel the event
 */
export interface EventHandler {
  (event: RobustEvent|any): boolean|void;
}

export class EventDispatcher {
  static SINGLETON: EventDispatcher;
  private listeners: Map<string, Set<EventHandler>>;

  private constructor () {
    this.listeners = new Map();
  }
  listen (type: string, cb: EventHandler): this {
    let list = this.listeners.get(type);
    if (!list) {
      list = new Set();
      this.listeners.set(type, list);
    }
    list.add(cb);
    return this;
  }
  deafen (type: string, cb: EventHandler): this {
    let list = this.listeners.get(type);
    if (!list) return this;
    list.delete(cb);
    return this;
  }
  fire (event: RobustEvent): boolean {
    let type = event.type;
    let list = this.listeners.get(type);
    if (!list) return false;
    for (let cb of list) {
      if (cb(event)) return true;
    }
    return false;
  }
  static get (): EventDispatcher {
    if (!EventDispatcher.SINGLETON) EventDispatcher.SINGLETON = new EventDispatcher();
    return EventDispatcher.SINGLETON;
  }
}

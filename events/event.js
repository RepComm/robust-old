/**An event listener
 * Return true from this callback if you wish to cancel the event
 */
export class EventDispatcher {
  constructor() {
    this.listeners = new Map();
  }

  listen(type, cb) {
    let list = this.listeners.get(type);

    if (!list) {
      list = new Set();
      this.listeners.set(type, list);
    }

    list.add(cb);
    return this;
  }

  deafen(type, cb) {
    let list = this.listeners.get(type);
    if (!list) return this;
    list.delete(cb);
    return this;
  }

  fire(event) {
    let type = event.type;
    let list = this.listeners.get(type);
    if (!list) return false;

    for (let cb of list) {
      if (cb(event)) return true;
    }

    return false;
  }

  static get() {
    if (!EventDispatcher.SINGLETON) EventDispatcher.SINGLETON = new EventDispatcher();
    return EventDispatcher.SINGLETON;
  }

}
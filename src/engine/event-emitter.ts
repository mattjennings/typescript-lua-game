export class EventEmitter<
  Events extends Record<string, unknown> = Record<string, unknown>
> {
  // needed for type inference
  protected __events!: Events

  listeners: Partial<
    Record<keyof Events, LuaSet<(payload: Events[keyof Events]) => void>>
  > = {}

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = new LuaSet()
    }
    this.listeners[event]!.add(listener)
    return this
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ) {
    this.listeners[event]?.delete(listener)
    return this
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    if (!this.listeners[event]) {
      return
    }

    for (const listener of this.listeners[event]) {
      listener(payload)
    }
  }

  removeAllListeners() {
    this.listeners = {}
  }
}

export type EventsOf<T> = T extends EventEmitter<infer U> ? U : never
export type EventNameOf<T> = keyof EventsOf<T>

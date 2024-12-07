export class EventEmitter<
  Events extends Record<string, unknown> = Record<string, unknown>
> {
  listeners: Partial<
    Record<keyof Events, Set<(payload: Events[keyof Events]) => void>>
  > = {}

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set()
    }
    this.listeners[event]!.add(listener)
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ) {
    this.listeners[event]?.delete(listener)
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    for (const listener of this.listeners[event] ?? []) {
      listener(payload)
    }
  }

  removeAllListeners() {
    this.listeners = {}
  }
}

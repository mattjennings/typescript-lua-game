import { Entity, UpdateEvent } from "./entity"
import { EventEmitter } from "./event-emitter"

export abstract class Component<
  Events extends Record<string, unknown> = Record<string, unknown>
> extends EventEmitter<Events> {
  static type: string
  entity: Entity

  constructor(entity: Entity) {
    super()

    this.entity = entity
    entity.components.add(this)
  }

  onRemove(entity: Entity) {}

  onPreUpdate(ev: UpdateEvent) {}
  onUpdate(ev: UpdateEvent) {}
  onPostUpdate(ev: UpdateEvent) {}
}

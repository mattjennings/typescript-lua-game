import { Entity } from "./entity"
import { EventEmitter, EventsOf } from "./event-emitter"
import { Scene, SceneUpdateEvent } from "./scene"

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

  onAdd: (entity: Entity) => {}
  onRemove: (entity: Entity) => {}
}

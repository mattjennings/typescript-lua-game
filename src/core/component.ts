import { Entity } from "./entity"
import { EventEmitter, EventsOf } from "./event-emitter"
import { Scene, SceneUpdateEvent } from "./scene"

export abstract class Component<
  Events extends Record<string, unknown> = {}
> extends EventEmitter<Events> {
  static type: string
  entity?: Entity

  onAdd?: (entity: Entity<any, any, any>) => void
  onRemove?: (entity: Entity<any, any, any>) => void
}

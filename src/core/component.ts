import type { AnyEntity, Entity } from "./entity"
import { EventEmitter } from "./event-emitter"

export abstract class Component<
  Events extends Record<string, unknown> = {}
> extends EventEmitter<Events> {
  static type: string
  entity?: Entity

  onAdd?: (entity: AnyEntity) => void
  onRemove?: (entity: AnyEntity) => void
}

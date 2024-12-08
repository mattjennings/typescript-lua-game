import { Entity } from "./entity"
import { EventEmitter, EventsOf } from "./event-emitter"
import { Scene, SceneUpdateEvent } from "./scene"

export abstract class Component<
  Events extends Record<string, unknown> = Record<string, unknown>
> extends EventEmitter<Events> {
  static type: string
  entity: Entity

  private sceneListeners: Array<
    [keyof EventsOf<Scene>, (payload: any) => void]
  > = []

  constructor(entity: Entity) {
    super()

    this.entity = entity
    entity.components.add(this)
  }

  onRemove: (entity: Entity) => {}

  $onScene<T extends keyof EventsOf<Scene>>(
    event: T,
    listener: (payload: EventsOf<Scene>[T]) => void
  ) {
    this.sceneListeners.push([event, listener])
  }
}

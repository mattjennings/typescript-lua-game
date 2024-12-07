import { Engine } from "../engine"
import { Entity, UpdateEvent } from "../entity"
import { EventEmitter } from "../event-emitter"
import { SystemQuery } from "./system-query"

export class System extends EventEmitter<{
  entityadd: Entity
  entityremoved: Entity
}> {
  static priority: number
  engine!: Engine

  query = new SystemQuery([])

  async init() {
    this.query.on("entityadd", this.onEntityAdd)
    this.query.on("entityremoved", this.onEntityRemove)
  }

  update(event: UpdateEvent, entities: Set<Entity>) {}

  draw(entities: Set<Entity>) {}

  onEntityAdd = (entity: Entity) => {}
  onEntityRemove = (entity: Entity) => {}
}

import { Engine } from "./engine"
import { Entity, UpdateEvent } from "./entity"
import { EventEmitter } from "./event-emitter"
import { Component } from "./component"
import { Scene } from "./scene"
import { ConstructorOf } from "src/types"

export class SystemQuery extends EventEmitter<{
  entityadd: Entity
  entityremoved: Entity
}> {
  entities: Set<Entity> = new Set()

  private dirty: boolean = true
  private components: ConstructorOf<Component>[] | null = null

  constructor(components?: ConstructorOf<Component>[]) {
    super()
    if (components) {
      this.components = components
    }
  }

  invalidate() {
    this.dirty = true
  }

  get(scene: Scene) {
    if (!this.dirty || !this.components) {
      return this.entities
    }

    const previousEntities = new Set(this.entities)

    this.entities.clear()

    for (const entity of scene.entities) {
      let satisfiesQuery = true
      for (const component of this.components) {
        // ensure entity has all the components in the group
        if (!entity.components.get(component)) {
          satisfiesQuery = false
          break
        }
      }

      if (satisfiesQuery) {
        this.entities.add(entity)

        if (!previousEntities.has(entity)) {
          this.emit("entityadd", entity)
        }
      }
    }

    for (const entity of previousEntities) {
      if (!this.entities.has(entity)) {
        this.emit("entityremoved", entity)
      }
    }

    this.dirty = false
    return this.entities
  }
}

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

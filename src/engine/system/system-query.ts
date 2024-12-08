import { ConstructorOf } from "src/types"
import { Component } from "../component"
import { Entity } from "../entity"
import { EventEmitter } from "../event-emitter"
import { Scene } from "../scene"

export class SystemQuery extends EventEmitter<{
  entityadd: Entity
  entityremoved: Entity
}> {
  entities = new LuaSet<Entity>()

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

  getEntities(scene: Scene) {
    if (!this.dirty || !this.components) {
      return this.entities
    }

    const previousEntities = new Set(this.entities)

    for (const e of this.entities) {
      this.entities.delete(e)
    }

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

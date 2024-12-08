import { Engine } from "./engine"
import { Entity } from "./entity"
import { EventEmitter } from "./event-emitter"
import { System, SystemEntities } from "./system"

export class Scene extends EventEmitter<{
  update: { dt: number }
  draw: void
  entityadd: Entity
  entityremove: Entity
}> {
  engine!: Engine<any>
  entities = new LuaSet<Entity>()
  systems: System[] = []
  paused = false
  elapsedTime = 0

  entitiesBySystem = new LuaMap<System, SystemEntities>()

  addEntity(entity: Entity) {
    entity.scene = this
    entity.onAdd(this)
    entity.emit("add", this)

    this.emit("entityadd", entity)
    this.entities.add(entity)

    for (const system of this.systems) {
      if (!this.entitiesBySystem.has(system)) {
        this.entitiesBySystem.set(system, [])
      }

      let isForSystem = true
      const components = []
      for (const ctor of system.query) {
        const component = entity.components.get(ctor)
        if (component) {
          components.push(component)
        } else {
          isForSystem = false
          break
        }
      }

      if (isForSystem) {
        this.entitiesBySystem
          .get(system)!
          .push([entity, ...components] as const)
      }
    }
  }

  removeEntity(entity: Entity, destroy = false) {
    delete entity.scene

    if (destroy) {
      entity.destroy()
    }
    entity.onRemove(this)

    this.emit("entityremove", entity)
    this.entities.delete(entity)

    for (const system of this.systems) {
      const entities = this.entitiesBySystem.get(system)
      if (entities) {
        for (let i = 0; i < entities.length; i++) {
          if (entities[i][0] === entity) {
            entities[i] = undefined
            break
          }
        }
      }
    }
  }

  update(args: { dt: number }) {
    if (this.paused) {
      return
    }
    this.emit("update", args)
    this.elapsedTime += args.dt

    // for (const entity of this.currentScene.entities) {
    //   entity.onPreUpdate(args)
    //   entity.emit("preupdate", args)
    // }

    // for (const entity of this.currentScene.entities) {
    //   entity.onUpdate(args)
    //   entity.emit("update", args)
    // }

    for (const system of this.systems) {
      if ("update" in system) {
        system.update(
          args,
          (this.entitiesBySystem.get(system) || []) as SystemEntities<
            readonly []
          >
        )
      }
    }

    // for (const entity of this.currentScene.entities) {
    //   entity.onPostUpdate(args)
    //   entity.emit("postupdate", args)
    // }
  }

  draw() {
    if (this.paused) {
      return
    }

    for (const system of this.systems) {
      if ("draw" in system) {
        system.draw(
          (this.entitiesBySystem.get(system) || []) as SystemEntities<
            readonly []
          >
        )
      }
    }

    love.graphics.print(
      `FPS: ${love.timer.getFPS().toString()}`,
      love.window.getSafeArea()[2] - 60,
      0
    )
  }

  onStart() {}
}

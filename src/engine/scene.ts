import { Engine } from "./engine"
import { Entity } from "./entity"
import { EventEmitter } from "./event-emitter"
import { System, SystemEntities } from "./system"

export class Scene extends EventEmitter<{
  preupdate: { dt: number }
  update: { dt: number }
  postupdate: { dt: number }
  predraw: void
  draw: void
  postdraw: void
  entityadd: Entity
  entityremove: Entity
}> {
  engine!: Engine<any>
  entities = new LuaSet<Entity>()
  systems: System[] = []
  paused = false
  elapsedTime = 0

  private entitiesBySystem = new LuaMap<System, SystemEntities>()

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

  updateEntity(entity: Entity) {
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

    this.emit("preupdate", args)

    this.emit("update", args)
    this.elapsedTime += args.dt

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

    this.emit("postupdate", args)
  }

  draw() {
    if (this.paused) {
      return
    }

    this.emit("predraw", undefined)
    this.emit("draw", undefined)

    for (const system of this.systems) {
      if ("draw" in system) {
        system.draw(
          (this.entitiesBySystem.get(system) || []) as SystemEntities<
            readonly []
          >
        )
      }
    }

    this.emit("postdraw", undefined)

    love.graphics.print(
      `FPS: ${love.timer.getFPS().toString()}`,
      love.window.getSafeArea()[2] - 60,
      0
    )
  }

  onStart() {}
}

export type SceneUpdateEvent = { dt: number }

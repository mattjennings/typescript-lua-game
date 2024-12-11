import { Engine } from "./engine"
import { Entity } from "./entity"
import { EventEmitter } from "./event-emitter"
import { System, SystemEntities } from "./system"
import { drawQueue } from "./features/ui/jsx"

export class Scene extends EventEmitter<{
  preupdate: { dt: number }
  update: { dt: number }
  postupdate: { dt: number }
  predraw: void
  draw: void
  postdraw: void
  entityadd: Entity<any, any, any>
  entityremove: Entity<any, any, any>
}> {
  engine!: Engine<any>
  entities = new LuaSet<Entity<any, any, any>>()
  paused = false
  elapsedTime = 0

  protected systems: System[] = []
  private entitiesBySystem = new LuaMap<System, SystemEntities>()

  constructor() {
    super()

    for (const system of this.systems) {
      this.entitiesBySystem.set(system, new LuaMap())
    }
  }

  addEntity(entity: Entity<any, any, any>) {
    entity.scene = this
    entity.emit("add", this)
    this.emit("entityadd", entity)

    this.entities.add(entity)

    for (const system of this.systems) {
      if (!this.entitiesBySystem.has(system)) {
        this.entitiesBySystem.set(system, new LuaMap())
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
        this.entitiesBySystem.get(system)!.set(entity, components)
      }
    }
  }

  removeEntity(entity: Entity<any, any, any>, destroy = false) {
    entity.scene = undefined

    if (destroy) {
      entity.destroy()
    }

    this.emit("entityremove", entity)
    entity.emit("remove", this)
    this.entities.delete(entity)

    for (const system of this.systems) {
      const entities = this.entitiesBySystem.get(system)!

      if (entities.get(entity)) {
        entities.delete(entity)
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
      system.update?.(args, this.entitiesBySystem.get(system)!)
    }

    this.emit("postupdate", args)
  }

  draw() {
    if (this.paused) {
      return
    }

    this.emit("predraw", undefined)
    this.drawElements()

    this.emit("draw", undefined)
    for (const system of this.systems) {
      system.draw?.(this.entitiesBySystem.get(system)!)
    }
    this.drawElements()

    this.emit("postdraw", undefined)
    this.drawElements()

    love.graphics.print(
      `FPS: ${love.timer.getFPS().toString()}`,
      love.window.getSafeArea()[2] - 60,
      0
    )
  }

  drawElements(elements: JSX.Element[] = drawQueue.get()) {
    for (const element of elements) {
      element?.draw?.()
    }

    drawQueue.clear()
  }

  onStart() {}
}

export type SceneUpdateEvent = { dt: number }

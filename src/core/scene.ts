import { AnyEntity, Entity } from "./entity"
import { EventEmitter } from "./event-emitter"
import { System, SystemEntities } from "./system"
import { drawQueue } from "./features/ui/jsx"
import { ConstructorOf } from "src/types"

export class Scene extends EventEmitter<{
  start: void
  end: void
  preupdate: { dt: number }
  update: { dt: number }
  postupdate: { dt: number }
  prefixedupdate: { dt: number }
  fixedupdate: { dt: number }
  postfixedupdate: { dt: number }
  predraw: void
  draw: void
  postdraw: void
  entityadd: Entity<any, any, any>
  entityremove: Entity<any, any, any>
}> {
  entities = new LuaSet<Entity<any, any, any>>()
  paused = false
  elapsedTime = 0
  name: string

  protected systems: System[] = []
  private entitiesBySystem = new LuaMap<
    System,
    SystemEntities<readonly ConstructorOf<any>[]>
  >()

  constructor(name: string) {
    super()

    this.name = name
  }

  addEntity<T extends AnyEntity>(entity: T) {
    entity.scene = this
    entity.emit("add", this)
    this.emit("entityadd", entity)

    this.entities.add(entity)

    for (const system of this.systems) {
      if (!this.entitiesBySystem.has(system)) {
        this.entitiesBySystem.set(system, new LuaMap())
      }

      let isForSystem = true
      const components: any[] = []
      for (const ctor of system.query) {
        const component = entity.components.get(ctor as any)

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

    return entity
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
      system.update?.(this.entitiesBySystem.get(system)! ?? new LuaMap(), args)
    }

    this.emit("postupdate", args)
  }

  fixedUpdate(args: { dt: number }) {
    if (this.paused) {
      return
    }

    this.emit("prefixedupdate", args)
    this.emit("fixedupdate", args)
    for (const system of this.systems) {
      system.fixedUpdate?.(
        this.entitiesBySystem.get(system) ?? new LuaMap(),
        args
      )
    }
    this.emit("postfixedupdate", args)
  }

  draw() {
    if (this.paused) {
      return
    }

    this.emit("predraw", undefined)
    this.drawElements()

    this.emit("draw", undefined)
    for (const system of this.systems) {
      system.draw?.(this.entitiesBySystem.get(system) ?? new LuaMap())
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

  onStart(listener: () => void): this {
    return this.on("start", listener)
  }

  onEnd(listener: () => void): this {
    return this.on("end", listener)
  }

  onUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.on("update", listener)
  }

  onPreUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.on("preupdate", listener)
  }

  onPostUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.on("postupdate", listener)
  }

  onPreFixedUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.on("prefixedupdate", listener)
  }

  onFixedUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.on("fixedupdate", listener)
  }

  onPostFixedUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.on("postfixedupdate", listener)
  }

  onDraw(listener: () => void): this {
    return this.on("draw", listener)
  }

  onPreDraw(listener: () => void): this {
    return this.on("predraw", listener)
  }

  onPostDraw(listener: () => void): this {
    return this.on("postdraw", listener)
  }
}

export type SceneUpdateEvent = { dt: number }

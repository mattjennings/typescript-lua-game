import type { AnyEntity, Entity } from "./entity"
import { EventEmitter } from "./event-emitter"
import type { System, SystemEntities, SystemQuery } from "./system"
import { drawQueue } from "./features/ui/jsx"
import type { ConstructorOf } from "src/types"
import type { Engine } from "./engine"

export type SceneUpdateEvent = { dt: number }

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
  engine: Engine<any>
  paused = false
  elapsedTime = 0
  name: string

  entities: EntityManager

  constructor(engine: Engine<any>, name: string) {
    super()

    this.name = name
    this.engine = engine
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.entities = new EntityManager(engine.systems)
  }

  addEntity<T extends AnyEntity>(entity: T) {
    entity.scene = this
    this.entities.addEntity(entity)
    entity.emit("add", this)
    this.emit("entityadd", entity)
    return entity
  }

  removeEntity(entity: Entity<any, any, any>, destroy = false) {
    entity.scene = undefined

    if (destroy) {
      entity.destroy()
    }

    this.entities.removeEntity(entity)
    this.emit("entityremove", entity)
    entity.emit("remove", this)
  }

  update(args: { dt: number }) {
    if (this.paused) {
      return
    }

    this.emit("preupdate", args)

    this.emit("update", args)
    this.elapsedTime += args.dt

    for (const system of this.engine.systems) {
      system.update?.(this.entities.byQuery.get(system.query)!, args)
    }

    this.emit("postupdate", args)
  }

  fixedUpdate(args: { dt: number }) {
    if (this.paused) {
      return
    }

    this.emit("prefixedupdate", args)
    this.emit("fixedupdate", args)
    for (const system of this.engine.systems) {
      system.fixedUpdate?.(this.entities.byQuery.get(system.query)!, args)
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
    for (const system of this.engine.systems) {
      system.draw?.(this.entities.byQuery.get(system.query)!)
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

class EntityManager {
  all = new LuaSet<Entity<any, any, any>>()
  byQuery = new LuaMap<
    SystemQuery<any>,
    SystemEntities<readonly ConstructorOf<any>[]>
  >()
  systems: System[] = []

  constructor(systems: System[]) {
    this.systems = systems

    for (const system of systems) {
      this.byQuery.set(system.query, new LuaMap())
    }
  }

  addEntity(entity: Entity<any, any, any>) {
    this.all.add(entity)
    this.updateEntity(entity)
  }

  removeEntity(entity: Entity<any, any, any>) {
    this.all.delete(entity)

    for (const [query, entities] of this.byQuery) {
      if (entities.get(entity)) {
        entities.delete(entity)
      }
    }
  }

  updateEntity(entity: Entity<any, any, any>) {
    for (const system of this.systems) {
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
        this.byQuery.get(system.query)!.set(entity, components)
      }
    }
  }
}

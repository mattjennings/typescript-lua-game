import { ConstructorOf } from "src/types"
import { EventEmitter } from "./event-emitter"
import { Scene } from "./scene"
import { System } from "./system"
import { Entity } from "./entity"

export interface EngineArgs<TSceneKey extends string> {
  systems: System[]
  types?: {
    scenes?: TSceneKey
  }
}
interface EngineDefinition<TSceneKey extends string> {
  scenes?: TSceneKey
}

export type EngineScene<T> = T extends EngineDefinition<infer T> ? T : never

export class Engine<
  TSceneKey extends string = string,
  TEngine extends EngineDefinition<TSceneKey> = EngineDefinition<TSceneKey>
> extends EventEmitter<{
  update: { dt: number }
  draw: void
  scenechange: { name: EngineScene<TEngine>; scene: Scene }
}> {
  systems: System[] = []
  scenes: Record<EngineScene<TEngine>, Scene> = {} as any
  currentScene!: Scene

  elapsedTime = 0

  paused = false
  started = false

  constructor(args: EngineArgs<TSceneKey>) {
    super()

    // systems
    for (const system of args.systems) {
      this.addSystem(system)
    }

    love.update = (dt: number) => {
      if (this.paused) {
        return
      }

      this.update({ dt })
    }

    love.draw = () => {
      this.draw()
    }
  }

  async start({ scene }: { scene: EngineScene<TEngine> }) {
    this.on("scenechange", () => {
      for (const system of this.systems) {
        system.query.invalidate()
      }
    })

    this.started = true
    this.gotoScene(scene)

    for (const system of this.systems) {
      await system.init()
    }
  }

  update(args: { dt: number }) {
    if (!this.paused) {
      this.emit("update", args)
      this.elapsedTime += args.dt
      for (const entity of this.currentScene.entities) {
        entity.onPreUpdate(args)
        entity.emit("preupdate", args)
      }

      for (const entity of this.currentScene.entities) {
        entity.onUpdate(args)
        entity.emit("update", args)
      }

      for (const system of this.systems) {
        system.update(args, system.query.getEntities(this.currentScene))
      }

      for (const entity of this.currentScene.entities) {
        entity.onPostUpdate(args)
        entity.emit("postupdate", args)
      }
    }
  }

  draw() {
    if (!this.paused) {
      this.emit("draw", undefined)
      for (const entity of this.currentScene.entities) {
        entity.onPreDraw()
        entity.emit("predraw", undefined)
      }

      for (const entity of this.currentScene.entities) {
        entity.onDraw()
        entity.emit("draw", undefined)
      }

      for (const system of this.systems) {
        system.draw(system.query.getEntities(this.currentScene))
      }

      for (const entity of this.currentScene.entities) {
        entity.onPostDraw()
        entity.emit("postdraw", undefined)
      }
    }
  }

  addSystem(system: System) {
    this.systems.push(system)
    system.engine = this

    this.systems.sort((a, b) => {
      const aPriority = a.constructor["priority"] ?? 0
      const bPriority = b.constructor["priority"] ?? 0

      return bPriority - aPriority
    })
  }

  removeSystem(system: System) {
    this.systems.splice(this.systems.indexOf(system), 1)
  }

  getSystem(system: ConstructorOf<System>) {
    return this.systems.find((s) => s.constructor === system)
  }

  pause() {
    this.paused = true
  }

  resume() {
    this.paused = false
  }

  addScene(name: EngineScene<TEngine>, Scene: ConstructorOf<Scene>) {
    print("Adding scene", name)
    this.scenes[name] = new Scene()
  }

  gotoScene(name: EngineScene<TEngine>) {
    if (!this.scenes[name]) {
      throw new Error(`Scene "${name.toString()}" not found`)
    }

    if (this.currentScene) {
      this.currentScene.off("entityadd", this.onEntityAdd)
      this.currentScene.off("entityremove", this.onEntityRemove)
    }
    this.currentScene = this.scenes[name]!
    this.currentScene.on("entityadd", this.onEntityAdd)
    this.currentScene.on("entityremove", this.onEntityRemove)

    this.emit("scenechange", {
      name: name,
      scene: this.currentScene,
    })
    this.currentScene.onStart()
  }

  protected onEntityAdd = () => {
    for (const system of this.systems) {
      system.query.invalidate()
    }
  }

  protected onEntityRemove = () => {
    for (const system of this.systems) {
      system.query.invalidate()
    }
  }

  get Scene() {
    const _engine = this as Engine<TSceneKey>
    const ctor = class extends Scene {
      engine = _engine
    }

    return ctor
  }

  get Entity() {
    const _engine = this as Engine<TSceneKey>
    const ctor = class extends Entity {
      engine = _engine
    }

    return ctor
  }

  timer = {
    wait: (s: number) => {
      return new Promise<void>((resolve) => {
        const onupdate = ({ dt }: { dt: number }) => {
          s -= dt
          if (s <= 0) {
            this.off("update", onupdate)
            resolve()
          }
        }

        this.on("update", onupdate)
      })
    },
  }
}

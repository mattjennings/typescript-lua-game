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
  scenechange: { name: EngineScene<TEngine>; scene: Scene }
}> {
  systems: System[] = []
  scenes: Record<EngineScene<TEngine>, Scene> = {} as any
  currentScene!: Scene

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
      for (const entity of this.currentScene.entities) {
        entity.onPreUpdate(args)
        entity.emit("preupdate", args)
      }

      for (const entity of this.currentScene.entities) {
        entity.onUpdate(args)
        entity.emit("update", args)
      }

      for (const system of this.systems) {
        system.update(args, system.query.get(this.currentScene))
      }

      for (const entity of this.currentScene.entities) {
        entity.onPostUpdate(args)
        entity.emit("postupdate", args)
      }
    }
  }

  draw() {
    if (!this.paused) {
      for (const entity of this.currentScene.entities) {
        entity.onPreDraw()
        entity.emit("predraw", undefined)
      }

      for (const entity of this.currentScene.entities) {
        entity.onDraw()
        entity.emit("draw", undefined)
      }

      for (const system of this.systems) {
        system.draw(system.query.get(this.currentScene))
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

    this.systems.sort(
      // @ts-ignore
      (a, b) => b.constructor["priority"] - a.constructor["priority"]
    )
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
}

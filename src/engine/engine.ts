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
    this.started = true
    this.gotoScene(scene)
  }

  update(args: { dt: number }) {
    if (!this.paused) {
      this.emit("update", args)
      this.elapsedTime += args.dt
      this.currentScene.update(args)
    }
  }

  draw() {
    if (!this.paused) {
      this.emit("draw", undefined)
      this.currentScene.draw()
    }
  }

  addSystem(system: System) {
    this.systems.push(system)
    system.engine = this
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

  protected onEntityAdd = () => {}

  protected onEntityRemove = () => {}

  get Scene() {
    const _engine = this as Engine<TSceneKey>
    const ctor = class extends Scene {
      engine = _engine
      systems = _engine.systems
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

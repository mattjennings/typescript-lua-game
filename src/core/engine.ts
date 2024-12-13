import "./features/ui"
import { ConstructorOf } from "src/types"
import { EventEmitter } from "./event-emitter"
import { Scene } from "./scene"
import { System } from "./system"
import { Entity } from "./entity"
import { Component } from "./component"
import { system } from "love"
import { pause } from "love.audio"
import { draw } from "love.graphics"
import { KeyConstant, Scancode } from "love.keyboard"

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
  fixedupdate: { dt: number }
  draw: void
  scenechange: { name: EngineScene<TEngine>; scene: Scene }
}> {
  systems: System[] = []
  scenes: Record<EngineScene<TEngine>, Scene> = {} as any
  currentScene!: Scene

  private accumulator = 0
  elapsedTime = 0

  paused = false
  started = false

  private debugStepMode = false
  private debugStep = false

  constructor(args: EngineArgs<TSceneKey>) {
    super()

    for (const system of args.systems) {
      this.addSystem(system)
    }

    love.update = (dt: number) => {
      if (this.paused) {
        return
      }

      if (this.debugStepMode) {
        if (this.debugStep) {
          this.update({ dt })
          this.debugStep = false
        }
      } else {
        this.update({ dt })
      }
    }

    love.draw = () => {
      this.draw()
    }

    love.keypressed = (
      key: KeyConstant,
      scancode: Scancode,
      isrepeat: boolean
    ) => {
      if (key === "`") {
        this.debugStepMode = !this.debugStepMode
      }

      if (this.debugStepMode && key === "space") {
        this.debugStep = true
      }
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

      this.accumulator += args.dt

      while (this.accumulator > 0) {
        this.accumulator -= args.dt
        const fixedDt = 1 / 60
        this.emit("fixedupdate", { dt: fixedDt })
        this.currentScene.fixedUpdate({ dt: fixedDt })
      }
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

    if (!!this.currentScene) {
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
      protected systems = _engine.systems
    }

    return ctor
  }

  createEntity<
    Comp extends Component<any>[] = [],
    Props extends Record<string, any> = {},
    Events extends Record<string, unknown> = {},
    Ent extends Entity<Comp, Props, Events, Engine<TSceneKey>> = Entity<
      Comp,
      Props,
      Events,
      Engine<TSceneKey>
    >
  >(name: string): Ent {
    const entity = new Entity(this, name)

    return entity as any as Ent
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

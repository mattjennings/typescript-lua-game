import { ConstructorOf } from "src/types"
import { Component } from "../component"
import { EventEmitter, EventNameOf, EventsOf } from "../event-emitter"
import { Scene, SceneUpdateEvent } from "../scene"
import { Engine } from "../engine"

export class Entity<
  C extends Component<any> = Component,
  P extends Record<string, any> = {},
  E extends Record<string, unknown> = {}
> extends EventEmitter<
  E & {
    add: Scene
    remove: Scene
    destroy: undefined
  }
> {
  name?: string = "Entity"
  engine!: Engine
  scene?: Scene
  components = new LuaMap<Function, C>()

  constructor(name?: string) {
    super()
    this.name = name
  }

  addToScene(scene: Scene) {
    scene.addEntity(this as any)
  }

  moveToScene(scene: Scene) {
    if (this.scene) {
      this.scene.removeEntity(this as any)
    }

    scene.addEntity(this as any)
  }

  /**
   * Removes the entity from the scene but does not destroy it.
   */
  removeFromScene() {
    if (this.scene) {
      this.scene.removeEntity(this as any)
    }
  }

  /**
   * Destroys the entity and removes it from the scene.
   */
  destroy() {
    if (this.scene) {
      this.scene.removeEntity(this as any, true)
    }
    this.emit("destroy", undefined as any)
    this.removeAllListeners()
    for (const [key, component] of this.components) {
      component.onRemove?.(this)
    }
  }

  set<Values extends Record<string, any>>(
    values: Values
  ): Entity<C, P & Values, E> & P & Values
  set<Name extends string, Value>(
    name: Name,
    value: Value
  ): Value extends Component
    ? Entity<C | Value, P & { [K in Name]: Value }, E> &
        P & { [K in Name]: Value }
    : Entity<C, P & { [K in Name]: Value }, E> & P & { [K in Name]: Value }

  set(...args: [string, any] | [Record<string, any>]): any {
    if (typeof args[0] === "string") {
      const [name, value] = args as [string, any]
      if (value instanceof Component) {
        this.addComponent(value)
      }

      // @ts-ignore
      this[name] = value
      return this as any
    } else if (typeof args[0] === "object") {
      const values = args[0] as Record<string, any>
      for (const [key, value] of pairs(values)) {
        this.set(key as string, value)
      }
      return this as any
    }

    throw new Error(
      `Unsupported data type for arguments in set. Expected string or object, received ${typeof args[0]}`
    )
  }

  addComponent<Value extends Component>(
    component: Component
  ): Entity<C | Value, P, E> & P {
    component.entity = this as any
    this.components.set(component.constructor, component as any)
    component.onAdd?.(this as any)
    return this as any
  }

  getComponent<Name extends ConstructorOf<Component>>(
    ctor: Name
  ): InstanceType<Name> {
    const componentInstance = this.components.get(ctor)
    if (!componentInstance) {
      throw new Error(`Component ${ctor.name} not found`)
    }
    return componentInstance as InstanceType<Name>
  }

  onSceneEvent<E extends EventNameOf<typeof this.scene>>(
    event: E,
    listener: (payload: EventsOf<typeof this.scene>[E]) => void
  ): this {
    if (this.scene) {
      this.scene.on(event as any, listener)
    } else {
      this.on("add", (scene) => {
        scene!.on(event as any, listener)
      })
    }

    this.on("remove", (scene) => {
      scene!.off(event as any, listener as any)
    })
    return this
  }

  onUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.onSceneEvent("update", listener)
  }

  onPreUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.onSceneEvent("preupdate", listener)
  }

  onPostUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.onSceneEvent("postupdate", listener)
  }

  onPreFixedUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.onSceneEvent("prefixedupdate", listener)
  }

  onFixedUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.onSceneEvent("fixedupdate", listener)
  }

  onPostFixedUpdate(listener: (ev: SceneUpdateEvent) => void): this {
    return this.onSceneEvent("postfixedupdate", listener)
  }

  onDraw(listener: () => void): this {
    return this.onSceneEvent("draw", listener)
  }

  onPreDraw(listener: () => void): this {
    return this.onSceneEvent("predraw", listener)
  }

  onPostDraw(listener: () => void): this {
    return this.onSceneEvent("postdraw", listener)
  }

  events<E extends Record<string, unknown>>(): Entity<C, P, E> {
    return this as any
  }
}

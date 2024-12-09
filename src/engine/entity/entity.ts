import { ConstructorOf } from "src/types"
import { Component } from "../component"
import { EventEmitter, EventNameOf, EventsOf } from "../event-emitter"
import { Scene } from "../scene"
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

  // Overloads
  add<Name extends string, Value>(
    name: Name,
    value: Value
  ): Value extends Component
    ? Entity<C | Value, P & { [K in Name]: Value }, E> &
        P & { [K in Name]: Value }
    : Entity<C, P & { [K in Name]: Value }, E> & P & { [K in Name]: Value }

  add<Value extends Component>(component: Value): Entity<C | Value, P, E> & P

  // Implementation
  add<C extends Component>(...args: [C] | [string, any]): any {
    if (typeof args[0] === "string") {
      // Named component addition
      const [name, value] = args as [string, Component]

      if (value instanceof Component) {
        value.entity = this as any
        this.components.set(value.constructor, value as any)
        value.onAdd?.(this as any)
      }

      // @ts-ignore
      this[name] = value
      return this as any
    } else {
      const [component] = args as [Component]
      this.components.set(component.constructor, component as any)
      component.onAdd?.(this as any)
      return this as any
    }
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

  events<E extends Record<string, unknown>>(): Entity<C, P, E> {
    return this as any
  }

  getComponent<C extends Component>(ctor: ConstructorOf<Component>): C {
    const componentInstance = this.components.get(ctor)
    if (!componentInstance) {
      throw new Error(`Component ${ctor.name} not found`)
    }
    return componentInstance as unknown as C
  }
}

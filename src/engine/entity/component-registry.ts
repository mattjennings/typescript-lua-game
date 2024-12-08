import { ConstructorOf } from "src/types"
import { Component } from "../component"
import { Entity } from "./entity"
import { EventEmitter } from "../event-emitter"
import { printTable } from "src/features/debug/print"

export class ComponentRegistry extends EventEmitter<{
  add: Component
  remove: Component
}> {
  entity: Entity
  private components = new LuaMap<string, Component<any>>()

  constructor(entity: Entity) {
    super()
    this.entity = entity
  }

  add<T extends Component<any>>(component: T): T {
    const ctor = component.constructor

    if (!ctor["type"]) {
      throw new Error(
        `Component ${ctor.name} is missing a static type property`
      )
    }

    if (this.components.has(ctor["type"])) {
      throw new Error(
        `Entity ${this.entity.name} already has a component of type ${ctor["type"]}`
      )
    }

    this.components.set(ctor["type"], component)
    component.entity = this.entity
    component.onAdd?.(this.entity)
    this.emit("add", component)

    return component
  }

  get<T extends Component<any>>(ctor: ConstructorOf<T>): T | undefined {
    const component = this.components.get(ctor["type"])

    if (component) {
      return component as T
    }

    return undefined
  }

  has<T extends Component<any>>(ctor: ConstructorOf<T>): boolean {
    print("has", ctor["type"], this.components.has(ctor["type"]))
    return this.components.has(ctor["type"])
  }

  delete(component: Component): void {
    this.components.delete(component.constructor["type"])
    component.onRemove?.(this.entity)
    component.removeAllListeners()
    this.emit("remove", component)
  }

  destroy() {
    for (const [key, component] of this.components) {
      this.delete(component)
    }
  }

  *[Symbol.iterator]() {
    for (const [key, component] of this.components) {
      yield component
    }
  }
}

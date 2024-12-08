import { ConstructorOf } from "src/types"
import { Component } from "../component"
import { Entity } from "./entity"

export class ComponentRegistry {
  entity: Entity
  private components = new LuaMap<string, Component<any>>()

  constructor(entity: Entity) {
    this.entity = entity
  }

  add<T extends Component<any>>(component: T): T {
    const ctor = component.constructor as any
    if (!ctor.type) {
      throw new Error(
        `Component ${ctor.name} is missing a static type property`
      )
    }

    this.components.set(ctor.type, component)
    component.entity = this.entity

    // maybe a bad idea, but we need to preserve the identify to remove it later
    // component.onPreUpdate = component.onPreUpdate.bind(component)
    // component.onUpdate = component.onUpdate.bind(component)
    // component.onPostUpdate = component.onPostUpdate.bind(component)
    // this.entity.on("preupdate", component.onPreUpdate)
    // this.entity.on("update", component.onUpdate)
    // this.entity.on("postupdate", component.onPostUpdate)
    return component
  }

  get<T extends Component<any>>(cls: string | ConstructorOf<T>): T | undefined {
    const component = this.components.get(
      typeof cls === "string" ? cls : (cls as any).type
    )

    if (component) {
      return component as T
    }

    return undefined
  }

  remove(component: Component): void {
    this.components.delete((component.constructor as any).type)
    component.onRemove(this.entity)
    // this.entity.off("preupdate", component.onPreUpdate)
    // this.entity.off("update", component.onUpdate)
    // this.entity.off("postupdate", component.onPostUpdate)
  }

  destroy() {
    for (const [key, component] of this.components) {
      this.remove(component)
    }
  }

  *[Symbol.iterator]() {
    for (const [key, component] of this.components) {
      yield component
    }
  }
}

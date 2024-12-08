import { ConstructorOf } from "src/types"
import { Engine } from "../engine"
import { Entity } from "../entity"
import { EventEmitter } from "../event-emitter"

import { Component } from "../component"
import { SceneUpdateEvent } from "../scene"

export class System<
  T extends Readonly<Component[]> = Readonly<Component[]>
> extends EventEmitter<{
  entityadd: Entity
  entityremoved: Entity
}> {
  readonly query: Readonly<ConstructorOf<T[number]>[]>
  lifecycle: "update" | "draw" = "update"
  engine!: Engine

  update?: (event: SceneUpdateEvent, entities: SystemEntities<T>) => void
  draw?: (entities: SystemEntities<T>) => void

  onEntityAdd = (entity: Entity) => {}
  onEntityRemove = (entity: Entity) => {}
}

export type SystemEntities<
  T extends Readonly<Component[]> = Readonly<Component[]>
> = LuaMap<Entity, T>

/**
 * helper function to create a system class with proper types
 */
export function createSystemClass<
  Q extends Readonly<ConstructorOf<Component>[]>
>(args: {
  query: Q
  update?: (
    event: SceneUpdateEvent,
    entities: SystemEntities<{ [K in keyof Q]: InstanceType<Q[K]> }>
  ) => void
  draw?: (
    entities: SystemEntities<{ [K in keyof Q]: InstanceType<Q[K]> }>
  ) => void
  onEntityAdd?: (entity: Entity) => void
  onEntityRemove?: (entity: Entity) => void
}) {
  return class extends System<{ [K in keyof Q]: InstanceType<Q[K]> }> {
    query = args.query as any

    update = args.update
    draw = args.draw

    onEntityAdd = args.onEntityAdd
    onEntityRemove = args.onEntityRemove
  }
}

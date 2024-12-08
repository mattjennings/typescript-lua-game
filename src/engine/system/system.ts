import { ConstructorOf } from "src/types"
import { Engine } from "../engine"
import { Entity, UpdateEvent } from "../entity"
import { EventEmitter } from "../event-emitter"

import { Component } from "../component"

export class System<
  T extends Readonly<Component[]> = Readonly<Component[]>
> extends EventEmitter<{
  entityadd: Entity
  entityremoved: Entity
}> {
  readonly query: Readonly<ConstructorOf<T[number]>[]>
  lifecycle: "update" | "draw" = "update"
  engine!: Engine

  update?: (event: UpdateEvent, entities: SystemEntities<T>) => void
  draw?: (entities: SystemEntities<T>) => void

  onEntityAdd = (entity: Entity) => {}
  onEntityRemove = (entity: Entity) => {}
}

export type SystemEntities<
  T extends Readonly<Component[]> = Readonly<Component[]>
> = Array<[Entity, ...T]>

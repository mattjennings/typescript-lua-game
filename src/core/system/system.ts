import { ConstructorOf } from "src/types"
import { Engine } from "../engine"
import { Entity } from "../entity"
import { EventEmitter } from "../event-emitter"
import { Component } from "../component"

export type SystemQuery<T extends Readonly<Component[]>> = Readonly<{
  [K in keyof T]: ConstructorOf<T[K]>
}>

export type SystemEntities<T extends SystemQuery<any>> = LuaMap<
  Entity,
  {
    [K in keyof T]: InstanceType<T[K]>
  }
>

export class System<
  T extends SystemQuery<any> = SystemQuery<any>
> extends EventEmitter<{
  entityadd: Entity
  entityremoved: Entity
}> {
  readonly query!: T
  engine!: Engine

  update?: (entities: any, event: UpdateEvent) => void
  fixedUpdate?: (entities: any, event: UpdateEvent) => void
  draw?: (entities: any) => void

  onEntityAdd = (entity: Entity) => {}
  onEntityRemove = (entity: Entity) => {}
}

export type SystemUpdateFn<T extends SystemQuery<any>> = (
  entities: SystemEntities<T>,
  event: UpdateEvent
) => void

export type SystemDrawFn<T extends SystemQuery<any>> = (
  entities: SystemEntities<T>
) => void

export type SystemFixedUpdateFn<T extends SystemQuery<any>> = (
  entities: SystemEntities<T>,
  event: UpdateEvent
) => void

export type UpdateEvent = {
  dt: number
}

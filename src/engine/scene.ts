import { Engine } from "./engine"
import { Entity } from "./entity"
import { EventEmitter } from "./event-emitter"
import { System } from "./system"

export class Scene extends EventEmitter<{
  entityadd: Entity
  entityremove: Entity
}> {
  engine!: Engine<any>
  entities = new LuaSet<Entity>()
  systems: System[] = []
  paused = false

  addEntity(entity: Entity) {
    entity.scene = this
    entity.onAdd(this)
    entity.emit("add", this)

    this.emit("entityadd", entity)
    this.entities.add(entity)
  }

  removeEntity(entity: Entity, destroy = false) {
    delete entity.scene

    if (destroy) {
      entity.destroy()
    }
    entity.onRemove(this)

    this.emit("entityremove", entity)
    this.entities.delete(entity)
  }

  update(args: { dt: number }) {
    if (this.paused) {
      return
    }
    // this.emit("update", args)
    // this.elapsedTime += args.dt
    // for (const entity of this.currentScene.entities) {
    //   entity.onPreUpdate(args)
    //   entity.emit("preupdate", args)
    // }

    // for (const entity of this.currentScene.entities) {
    //   entity.onUpdate(args)
    //   entity.emit("update", args)
    // }

    for (const system of this.systems) {
      system.update(args, system.query.getEntities(this))
    }

    // for (const entity of this.currentScene.entities) {
    //   entity.onPostUpdate(args)
    //   entity.emit("postupdate", args)
    // }
  }

  draw() {
    if (this.paused) {
      return
    }

    for (const system of this.systems) {
      system.draw(system.query.getEntities(this))
    }

    love.graphics.print(
      `FPS: ${love.timer.getFPS().toString()}`,
      love.window.getSafeArea()[2] - 60,
      0
    )
  }

  onStart() {}
}

import { Engine } from "../engine"
import { EventEmitter } from "../event-emitter"
import { Scene } from "../scene"
import { ComponentRegistry } from "./component-registry"

export type UpdateEvent = { dt: number }

export abstract class Entity extends EventEmitter<{
  add: Scene
  remove: Scene
  destroy: void
  preupdate: UpdateEvent
  update: UpdateEvent
  postupdate: UpdateEvent
  predraw: void
  draw: void
  postdraw: void
}> {
  name?: string = "Entity"
  engine?: Engine
  scene?: Scene

  components = new ComponentRegistry(this)

  onPreUpdate = (args: UpdateEvent) => {}
  onUpdate = (args: UpdateEvent) => {}
  onPostUpdate = (args: UpdateEvent) => {}

  onPreDraw = () => {}
  onDraw = () => {}
  onPostDraw = () => {}

  /**
   * Removes the entity from the scene but does not destroy it.
   */
  remove() {
    if (this.scene) {
      this.scene.removeEntity(this)
      this.emit("remove", this.scene)
    }
  }

  /**
   * Destroys the entity and removes it from the scene.
   */
  destroy() {
    if (this.scene) {
      this.scene.removeEntity(this, true)
    }
    this.removeAllListeners()
    this.components.destroy()
  }

  onAdd = (scene: Scene) => {}
  onRemove = (scene: Scene) => {}
}

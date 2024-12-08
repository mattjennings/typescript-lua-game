import { Engine } from "../engine"
import { EventEmitter, EventsOf } from "../event-emitter"
import { Scene, SceneUpdateEvent } from "../scene"
import { ComponentRegistry } from "./component-registry"

export class Entity extends EventEmitter<{
  add: Scene
  remove: Scene
  destroy: void
}> {
  name?: string = "Entity"
  engine!: Engine
  scene!: Scene
  components = new ComponentRegistry(this)

  constructor() {
    super()

    this.on("add", (scene) => {
      if (this.onPreUpdate) {
        scene.on("preupdate", this.onPreUpdate)
      }

      if (this.onUpdate) {
        scene.on("update", this.onUpdate)
      }

      if (this.onPostUpdate) {
        scene.on("postupdate", this.onPostUpdate)
      }

      if (this.onPreDraw) {
        scene.on("predraw", this.onPreDraw)
      }

      if (this.onDraw) {
        scene.on("draw", this.onDraw)
      }

      if (this.onPostDraw) {
        scene.on("postdraw", this.onPostDraw)
      }
    })

    this.on("remove", (scene) => {
      if (this.onPreUpdate) {
        scene.off("preupdate", this.onPreUpdate)
      }

      if (this.onUpdate) {
        scene.off("update", this.onUpdate)
      }

      if (this.onPostUpdate) {
        scene.off("postupdate", this.onPostUpdate)
      }

      if (this.onPreDraw) {
        scene.off("predraw", this.onPreDraw)
      }

      if (this.onDraw) {
        scene.off("draw", this.onDraw)
      }

      if (this.onPostDraw) {
        scene.off("postdraw", this.onPostDraw)
      }
    })
  }

  addToScene(scene: Scene) {
    scene.addEntity(this)
    this.emit("add", scene)
  }

  moveToScene(scene: Scene) {
    if (this.scene) {
      this.scene.removeEntity(this)
    }

    scene.addEntity(this)
  }

  /**
   * Removes the entity from the scene but does not destroy it.
   */
  removeFromScene() {
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
    this.emit("destroy", undefined)
    this.removeAllListeners()
    this.components.destroy()
  }

  onAdd = (scene: Scene) => {}

  onRemove = (scene: Scene) => {}

  onPreUpdate?: (event: SceneUpdateEvent) => void
  onUpdate?: (event: SceneUpdateEvent) => void
  onPostUpdate?: (event: SceneUpdateEvent) => void

  onPreDraw?: () => void
  onDraw?: () => void
  onPostDraw?: () => void
}

import { SystemEntities, createSystemClass } from "src/engine/system"
import { AnimationComponent } from "./animation-component"
import { GraphicsComponent } from "./graphics-component"
import { SceneUpdateEvent } from "src/engine"

export const AnimationSystem = createSystemClass({
  query: [AnimationComponent, GraphicsComponent] as const,

  update: (
    event: SceneUpdateEvent,
    entities: SystemEntities<[AnimationComponent<any>, GraphicsComponent]>
  ) => {
    for (const [entity, [animation, graphics]] of entities) {
      animation.update(event.dt)
      graphics.drawable = animation.spritesheet.image
      graphics.quad = animation.currentAnimation.quads[animation.currentFrame]
    }
  },
})

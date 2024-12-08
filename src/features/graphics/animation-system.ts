import { UpdateEvent, Entity } from "src/engine/entity"
import { SystemEntities, System } from "src/engine/system"
import { AnimationComponent } from "./animation-component"
import { GraphicsComponent } from "./graphics-component"

export class AnimationSystem extends System<
  [AnimationComponent<any>, GraphicsComponent]
> {
  readonly query = [AnimationComponent, GraphicsComponent] as const

  update = (
    event: UpdateEvent,
    entities: SystemEntities<[AnimationComponent<any>, GraphicsComponent]>
  ) => {
    for (const [entity, animation, graphics] of entities) {
      animation.update(event.dt)
      graphics.drawable = animation.spritesheet.image
      graphics.quad = animation.currentAnimation.quads[animation.currentFrame]
    }
  }
}

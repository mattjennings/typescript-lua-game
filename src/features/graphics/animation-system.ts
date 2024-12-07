import { UpdateEvent, Entity } from "src/engine/entity"
import { System, SystemQuery } from "src/engine/system"
import { AnimationComponent } from "./animation-component"
import { GraphicsComponent } from "./graphics-component"

export class AnimationSystem extends System {
  query = new SystemQuery([AnimationComponent, GraphicsComponent])

  update(event: UpdateEvent, entities: Set<Entity>): void {
    for (const entity of entities) {
      const animation = entity.components.get(AnimationComponent)!
      const graphics = entity.components.get(GraphicsComponent)

      animation.update(event.dt)
      graphics.drawable = animation.spritesheet.image
      graphics.quad = animation.currentAnimation.quads[animation.currentFrame]
    }
  }
}

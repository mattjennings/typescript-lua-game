import { Texture } from "love.graphics"
import { GraphicsComponent } from "./graphics-component"
import { TransformComponent } from "./transform-component"

import { SystemEntities, System } from "src/engine/system"

export class GraphicsSystem extends System<
  [GraphicsComponent, TransformComponent]
> {
  readonly query = [GraphicsComponent, TransformComponent] as const

  draw = (
    entities: SystemEntities<[GraphicsComponent, TransformComponent]>
  ) => {
    for (const [entity, graphics, transform] of entities) {
      const x = transform.x
      const y = transform.y
      const rotation = transform.rotation
      const scaleX =
        typeof transform.scale === "number"
          ? transform.scale
          : transform.scale[0]

      const scaleY =
        typeof transform.scale === "number"
          ? transform.scale
          : transform.scale[1]

      const originX = graphics.origin[0]
      const originY = graphics.origin[1]

      const shearX = graphics.shear[0]
      const shearY = graphics.shear[1]

      if (graphics.drawable) {
        if (graphics.quad) {
          love.graphics.draw(
            graphics.drawable as Texture,
            graphics.quad,
            x,
            y,
            rotation,
            scaleX,
            scaleY,
            originX,
            originY,
            shearX,
            shearY
          )
        } else {
          love.graphics.draw(
            graphics.drawable,
            x,
            y,
            rotation,
            scaleX,
            scaleY,
            originX,
            originY,
            shearX,
            shearY
          )
        }
      }
    }
  }
}

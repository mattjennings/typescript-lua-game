import { Texture } from "love.graphics"
import { GraphicsComponent } from "./graphics-component"
import { TransformComponent } from "./transform-component"
import { UpdateEvent, Entity } from "src/engine/entity"
import { System, SystemQuery } from "src/engine/system"

export class GraphicsSystem extends System {
  query = new SystemQuery([GraphicsComponent, TransformComponent])

  draw(entities: LuaSet<Entity>): void {
    for (const entity of entities) {
      const graphics = entity.components.get(GraphicsComponent)!
      const transform = entity.components.get(TransformComponent)!

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

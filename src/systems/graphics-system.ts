import { GraphicsComponent } from "src/components/graphics-component"
import { TransformComponent } from "src/components/transform-component"
import { UpdateEvent, Entity } from "src/engine/entity"
import { System, SystemQuery } from "src/engine/system"

export class GraphicsSystem extends System {
  query = new SystemQuery([GraphicsComponent, TransformComponent])

  update(event: UpdateEvent, entities: Set<Entity>): void {}

  draw(entities: Set<Entity>): void {
    for (const entity of entities) {
      const graphics = entity.components.get(GraphicsComponent)!
      const transform = entity.components.get(TransformComponent)!

      love.graphics.draw(
        graphics.image,
        transform.x,
        transform.y,
        transform.rotation,
        typeof transform.scale === "number"
          ? transform.scale
          : transform.scale[0],
        typeof transform.scale === "number"
          ? transform.scale
          : transform.scale[1],
        transform.origin[0],
        transform.origin[1],
        transform.shear[0],
        transform.shear[1]
      )
    }
  }
}

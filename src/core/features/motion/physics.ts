import {
  System,
  SystemEntities,
  SystemQuery,
  SystemUpdateFn,
} from "src/core/system"
import { TransformComponent } from "./transform"
import { BodyComponent } from "./body"
import { Vec2 } from "../math"

type Query = SystemQuery<[BodyComponent, TransformComponent]>

export class PhysicsSystem extends System<Query> {
  query = [BodyComponent, TransformComponent] as const

  fixedUpdate: SystemUpdateFn<Query> = (entities, { dt }) => {
    for (const [entity, [body, transform]] of entities) {
      const velocity = transform.position
        .clone()
        .sub(transform.prev.position)
        .scale(body.friction)

      if (body.gravity && !body.static) {
        velocity.y += 0.01 * dt * dt * 1000 * 1000
      }

      transform.position.add(velocity)
    }
  }
}

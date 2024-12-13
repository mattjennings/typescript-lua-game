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
  gravity = new Vec2(0, 0.01)

  constructor({
    gravity,
  }: {
    gravity?: Vec2
  } = {}) {
    super()
    if (gravity) {
      this.gravity = gravity
    }
  }

  fixedUpdate: SystemUpdateFn<Query> = (entities, { dt }) => {
    for (const [entity, [body, transform]] of entities) {
      const velocity = transform.position
        .clone()
        .sub(transform.prev.position)
        .scale(body.friction)

      if (body.gravity && !body.static) {
        velocity.add(
          this.gravity
            .clone()
            .scale(dt ** 2)
            .scale(1000 ** 2)
        )
      }

      transform.position.add(velocity)
    }
  }
}

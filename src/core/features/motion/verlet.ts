import type { SystemQuery, SystemUpdateFn } from "src/core/system"
import { System, SystemEntities } from "src/core/system"
import { TransformComponent } from "./transform"
import { BodyComponent } from "./body"
import { Vec2 } from "../math"

type Query = SystemQuery<[BodyComponent, TransformComponent]>

export class VerletSystem extends System<Query> {
  query = [BodyComponent, TransformComponent] as const
  gravity = new Vec2(0, 0.001)
  maxVelocity = new Vec2(100, 100)

  constructor({
    gravity,
    maxVelocity,
  }: {
    gravity?: Vec2
    maxVelocity?: Vec2
  } = {}) {
    super()
    if (gravity) {
      this.gravity = gravity
    }

    if (maxVelocity) {
      this.maxVelocity = maxVelocity
    }
  }

  fixedUpdate: SystemUpdateFn<Query> = (entities, { dt }) => {
    for (const [entity, [body, transform]] of entities) {
      const velocity = transform.position
        .clone()
        .sub(transform.prev.position)
        .mul(body.friction)

      if (body.gravity && !body.static) {
        velocity.add(
          this.gravity
            .clone()
            .scale(dt ** 2)
            .scale(1000 ** 2)
        )

        if (this.maxVelocity.x !== 0) {
          const sign = Math.sign(velocity.x)
          velocity.x = Math.min(Math.abs(velocity.x), this.maxVelocity.x) * sign
        }

        if (this.maxVelocity.y !== 0) {
          const sign = Math.sign(velocity.y)
          velocity.y = Math.min(Math.abs(velocity.y), this.maxVelocity.y) * sign
        }
      }

      if (Math.abs(velocity.y) > 1) {
        print(velocity.y)
      }

      transform.prev.position.set(transform.position.clone())
      transform.prev.scale.set(transform.scale.clone())
      transform.prev.rotation = transform.rotation

      transform.position.add(velocity)
    }
  }
}

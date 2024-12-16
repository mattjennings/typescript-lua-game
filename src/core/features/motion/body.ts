import { Component } from "src/core/component"
import { TransformComponent } from "./transform"
import { Vec2 } from "../math"
import { type Collider } from "./collider"
import { type Entity } from "src/core/entity"

export class BodyComponent<
  C extends Collider | undefined = undefined
> extends Component<{
  collision: {
    entity: Entity<[BodyComponent<Collider>], any, any>
    body: BodyComponent<Collider>
  }
}> {
  static type = "body"

  gravity = true
  friction = new Vec2(0, 0)
  static = false

  collider?: C

  constructor(
    args: {
      collider?: C
      static?: boolean
      gravity?: boolean
      friction?: Vec2
    } = {}
  ) {
    super()

    this.collider = args.collider
    this.gravity = args.gravity ?? this.gravity
    this.friction = args.friction ?? this.friction
    this.static = args.static ?? this.static
  }

  get velocity() {
    const transform = this.entity?.getComponent(TransformComponent)
    if (transform) {
      return transform.position.clone().sub(transform.prev.position)
    }

    return new Vec2(0, 0)
  }

  setVelocity(value: Vec2) {
    const transform = this.entity?.getComponent(TransformComponent)
    if (transform) {
      transform.prev.position = transform.position.clone().sub(value)
    }
  }

  onCollisionResolve(other: BodyComponent<Collider>) {
    return true
  }
}

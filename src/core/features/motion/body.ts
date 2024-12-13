import { Component } from "src/core/component"
import { TransformComponent } from "./transform"
import { Vec2 } from "../math"

export class BodyComponent extends Component {
  static type = "body"

  gravity = true
  friction = 0.9
  static = false

  constructor(
    args: { static?: boolean; gravity?: boolean; friction?: number } = {}
  ) {
    super()

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
}

import { Component } from "src/core/component"
import { TransformComponent } from "./transform"
import { Vec2 } from "../math"

export class Constraint {
  other: TransformComponent
  length: number
  stiffness: number

  constructor(
    other: TransformComponent,
    opts: {
      length: number
      stiffness: number
    }
  ) {
    this.other = other
    this.length = opts.length
    this.stiffness = opts.stiffness
  }

  protected update(self: TransformComponent) {
    const delta = self.position.sub(this.other.position)
    const dist = delta.length()
    const diff = (this.length - dist) / dist

    if (dist > this.length) {
      self.position = self.position.add(
        delta.scale(diff * 0.5 * this.stiffness)
      )
      this.other.position = this.other.position.sub(
        delta.scale(diff * 0.5 * this.stiffness)
      )
    }
  }
}

export class BodyComponent extends Component {
  static type = "body"

  private constraints = new LuaSet<Constraint>()

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
      return transform.position.sub(transform.prev.position)
    }

    return new Vec2(0, 0)
  }

  addConstraint(constraint: Constraint) {
    this.constraints.add(constraint)
  }

  removeConstraint(constraint: Constraint) {
    this.constraints.delete(constraint)
  }
}

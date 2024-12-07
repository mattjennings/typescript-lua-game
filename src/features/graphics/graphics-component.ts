import { Drawable, Quad } from "love.graphics"
import { Component } from "src/engine/component"
import { Entity } from "src/engine/entity"

export class GraphicsComponent extends Component {
  static type = "graphics"

  drawable?: Drawable
  quad?: Quad
  origin: [number, number] = [0, 0]
  shear: [number, number] = [0, 0]

  constructor(
    entity: Entity,
    args: {
      drawable?: Drawable
      quad?: Quad
      origin?: [number, number]
      shear?: [number, number]
    } = {}
  ) {
    super(entity)

    this.drawable = args.drawable
    this.quad = args.quad

    if (args.origin) {
      this.origin = args.origin
    }

    if (args.shear) {
      this.shear = args.shear
    }
  }
}

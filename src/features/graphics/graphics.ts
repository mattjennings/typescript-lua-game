import { Texture } from "love.graphics"
import { TransformComponent } from "./transform"
import { Drawable, Quad } from "love.graphics"
import { Component } from "src/engine/component"
import { createSystemClass } from "src/engine/system"

export class GraphicsComponent extends Component {
  static type = "graphics"

  drawable?: Drawable
  quad?: Quad
  origin: [number, number] = [0, 0]
  shear: [number, number] = [0, 0]

  constructor(
    args: {
      drawable?: Drawable
      quad?: Quad
      origin?: [number, number]
      shear?: [number, number]
    } = {}
  ) {
    super()

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

export const GraphicsSystem = createSystemClass({
  query: [GraphicsComponent, TransformComponent] as const,
  draw(entities) {
    for (const [entity, [graphics, transform]] of entities) {
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
  },
})

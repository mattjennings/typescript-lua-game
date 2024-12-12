import { Texture } from "love.graphics"
import { TransformComponent } from "../motion"
import { Drawable, Quad } from "love.graphics"
import { Component } from "src/core/component"

import { Vec2, Vec2Like } from "../math"
import { System, SystemEntities, SystemQuery } from "src/core/system"

export class GraphicsComponent extends Component {
  static type = "graphics"

  drawable?: Drawable
  quad?: Quad
  origin = new Vec2(0, 0)
  shear = new Vec2(0, 0)

  constructor(
    args: {
      drawable?: Drawable
      quad?: Quad
      origin?: Vec2Like
      shear?: Vec2Like
    } = {}
  ) {
    super()

    this.drawable = args.drawable
    this.quad = args.quad

    if (args.origin) {
      this.origin = new Vec2(args.origin)
    }

    if (args.shear) {
      this.shear = new Vec2(args.shear)
    }
  }
}

type Query = SystemQuery<[GraphicsComponent, TransformComponent]>
export class GraphicsSystem extends System<Query> {
  query = [GraphicsComponent, TransformComponent] as const
  draw = (entities: SystemEntities<Query>) => {
    for (const [entity, [graphics, transform]] of entities) {
      if (graphics.drawable) {
        if (graphics.quad) {
          love.graphics.draw(
            graphics.drawable as Texture,
            graphics.quad,
            transform.position.x,
            transform.position.y,
            transform.rotation,
            transform.scale.x,
            transform.scale.y,
            graphics.origin.x,
            graphics.origin.y,
            graphics.shear.x,
            graphics.shear.y
          )
        } else {
          love.graphics.draw(
            graphics.drawable,
            transform.position.x,
            transform.position.y,
            transform.rotation,
            transform.scale.x,
            transform.scale.y,
            graphics.origin.x,
            graphics.origin.y,
            graphics.shear.x,
            graphics.shear.y
          )
        }
      }
    }
  }
}

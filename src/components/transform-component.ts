import { Component } from "src/engine/component"
import { Entity } from "src/engine/entity"

export class TransformComponent extends Component {
  static type = "transform"

  x: number = 0
  y: number = 0
  rotation: number = 0
  scale: number | [number, number] = 1
  origin: [number, number] = [0, 0]
  shear: [number, number] = [0, 0]

  constructor(
    entity: Entity,
    args: {
      x?: number
      y?: number
      rotation?: number
      scale?: number | [number, number]
      origin?: [number, number]
      shear?: [number, number]
    }
  ) {
    super(entity)

    if (args.x) {
      this.x = args.x
    }

    if (args.y) {
      this.y = args.y
    }

    if (args.rotation) {
      this.rotation = args.rotation
    }

    if (args.scale || args.scale === 0) {
      this.scale = args.scale
    }

    if (args.origin) {
      this.origin = args.origin
    }

    if (args.shear) {
      this.shear = args.shear
    }
  }
}

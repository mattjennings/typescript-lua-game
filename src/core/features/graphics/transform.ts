import { Component } from "src/core/component"

export interface Transform {
  x: number
  y: number
  rotation: number
  scale: number | [number, number]
}

export class TransformComponent extends Component implements Transform {
  static type = "transform"

  x: number = 0
  y: number = 0
  rotation: number = 0
  scale: number | [number, number] = 1

  prev: Transform

  constructor(args: {
    x?: number
    y?: number
    rotation?: number
    scale?: number | [number, number]
  }) {
    super()
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

    this.prev = {
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      scale: this.scale,
    }
  }
}

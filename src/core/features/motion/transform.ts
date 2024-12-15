import { Component } from "src/core/component"
import type { SystemEntities, SystemQuery } from "src/core/system";
import { System } from "src/core/system"
import type { Vec2Like } from "../math";
import { Vec2 } from "../math"

export interface Transform {
  position: Vec2
  rotation: number
  scale: Vec2
}

export class TransformComponent extends Component implements Transform {
  static type = "transform"

  rotation: number = 0
  position = new Vec2(0, 0)
  scale = new Vec2(1, 1)

  prev: Transform

  constructor(args: {
    position?: Vec2Like
    rotation?: number
    scale?: number | Vec2Like
  }) {
    super()
    if (args.position) {
      this.position = new Vec2(args.position)
    }

    if (args.rotation) {
      this.rotation = args.rotation
    }

    if (args.scale) {
      this.scale = new Vec2(args.scale)
    }

    this.prev = {
      position: this.position.clone(),
      rotation: this.rotation,
      scale: this.scale.clone(),
    }
  }
}

type Query = SystemQuery<[TransformComponent]>
export class TransformSystem extends System<Query> {
  query = [TransformComponent] as const

  fixedUpdate = (entities: SystemEntities<Query>) => {
    for (const [entity, [transform]] of entities) {
      transform.prev = {
        position: transform.position.clone(),
        scale: transform.scale.clone(),
        rotation: transform.rotation,
      }
    }
  }
}

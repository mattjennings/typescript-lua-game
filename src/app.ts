import { Engine } from "./engine"
import { res } from "./res"
import {
  GraphicsSystem,
  TransformComponent,
  GraphicsComponent,
  Spritesheet,
} from "./features/graphics"
import { AnimationComponent } from "./features/graphics/animation-component"
import { AnimationSystem } from "./features/graphics/animation-system"
import { sleep } from "love.timer"

export const engine = new Engine({
  systems: [new AnimationSystem(), new GraphicsSystem()],
  types: {
    scenes: "level1",
  },
})

const spritesheet = new Spritesheet(res.images.player, {
  width: 28,
  height: 28,
})

class Player extends engine.Entity {
  animation = new AnimationComponent(this, {
    spritesheet,
    animations: {
      idle: {
        frameDuration: 0.32,
        quads: spritesheet.getQuads(8),
      },
      run: {
        frameDuration: 0.1,
        quads: spritesheet.getQuads(0, 1, 2, 3),
        loop: true,
      },
    },
    initial: "run",
  })

  constructor() {
    super()

    this.components.add(
      new TransformComponent(this, { x: 100, y: 100, scale: 10 })
    )
  }
}

class Level1 extends engine.Scene {
  constructor() {
    super()

    let player = new Player()
    this.entities.add(player)
  }

  onStart(): void {
    print("Level1 started")
  }
}

engine.addScene("level1", Level1)
engine.start({ scene: "level1" })

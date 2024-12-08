import { Component, Engine } from "./engine"
import { res } from "./res"
import {
  GraphicsSystem,
  TransformComponent,
  GraphicsComponent,
  Spritesheet,
} from "./features/graphics"
import { AnimationComponent } from "./features/graphics/animation-component"
import { AnimationSystem } from "./features/graphics/animation-system"

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

love.load = () => {
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

    constructor(x: number, y: number) {
      super()

      this.components.add(
        new TransformComponent(this, { x: x, y: y, scale: 1 })
      )
    }
  }

  class Level1 extends engine.Scene {
    a = []
    constructor() {
      super()

      const [x, y, width, height] = love.window.getSafeArea()

      print(`Safe area: ${x}x${y} ${width}x${height}`)

      for (let i = 0; i < 10000; i++) {
        const px = love.math.random(0, width)
        const py = love.math.random(0, height)
        this.addEntity(new Player(px, py))
      }
    }

    onStart(): void {
      print("Level1 started")
    }
  }

  engine.addScene("level1", Level1)
  engine.start({ scene: "level1" })
}

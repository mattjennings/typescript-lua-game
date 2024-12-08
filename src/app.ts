import { Component, Engine, Entity, Scene } from "./engine"
import { res } from "./res"
import {
  GraphicsSystem,
  TransformComponent,
  GraphicsComponent,
  Spritesheet,
  AnimationComponent,
  AnimationSystem,
} from "./features/graphics"

export const engine = new Engine({
  systems: [new AnimationSystem(), new GraphicsSystem()],
  types: {
    scenes: "level1",
  },
})

function createPlayer(x: number, y: number) {
  const spritesheet = new Spritesheet(res.images.player, {
    width: 28,
    height: 28,
  })

  const player = new engine.Entity("player")
    .add("transform", new TransformComponent({ x, y, scale: 3 }))
    .add(
      "animation",
      new AnimationComponent({
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
    )
    .onSceneEvent("update", (args) => {
      if (love.keyboard.isDown("left")) {
        player.transform.x -= 1
      }

      if (love.keyboard.isDown("right")) {
        player.transform.x += 1
      }
    })

  return player
}

love.load = () => {
  class Level1 extends engine.Scene {
    constructor() {
      super()

      const [x, y, width, height] = love.window.getSafeArea()

      for (let i = 0; i < 1; i++) {
        const px = love.math.random(0, width)
        const py = love.math.random(0, height)
        this.addEntity(createPlayer(px, py))
      }
    }

    onStart(): void {
      print("Level1 started")
    }
  }

  engine.addScene("level1", Level1)
  engine.start({ scene: "level1" })
}

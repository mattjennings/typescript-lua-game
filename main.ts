import * as lick from "lua/lick/lick"

// @ts-ignore
lick.reset = true
// @ts-ignore - enable if not using luaBundle
// lick.updateAllFiles = true

import { createPlayer } from "./src/entities/player"
import { engine } from "./src/engine"

love.load = () => {
  class Level1 extends engine.Scene {
    constructor() {
      super()

      const [x, y, width, height] = love.window.getSafeArea()

      this.addEntity(createPlayer(100, 100))
    }

    onStart(): void {
      print("Level1 started")
    }
  }

  engine.addScene("level1", Level1)
  engine.start({ scene: "level1" })
}

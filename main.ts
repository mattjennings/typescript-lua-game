/* eslint-disable @typescript-eslint/no-use-before-define */
import * as lick from "lua/lick/lick"

// @ts-ignore
lick.reset = true
// @ts-ignore - enable if not using luaBundle
// lick.updateAllFiles = true

import { engine } from "./src/engine"
import "src/levels/rope"

love.load = () => {
  engine.start({ scene: "rope" })
}

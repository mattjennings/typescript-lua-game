import { Engine } from "./core/engine"
import { AnimationSystem, GraphicsSystem } from "./core/features/graphics"

export const engine = new Engine({
  systems: [new AnimationSystem(), new GraphicsSystem()],
  types: {
    scenes: "level1",
  },
})

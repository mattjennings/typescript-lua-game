import { Engine } from "./core/engine"
import { AnimationSystem, GraphicsSystem } from "./core/features/graphics"
import { PhysicsSystem, TransformSystem } from "./core/features/motion"

export const engine = new Engine({
  systems: [
    new PhysicsSystem(),
    new TransformSystem(),
    new AnimationSystem(),
    new GraphicsSystem(),
  ],
  types: {
    scenes: "level1",
  },
})

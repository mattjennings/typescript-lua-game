import { Engine } from "./core/engine"
import { AnimationSystem, GraphicsSystem } from "./core/features/graphics"
import { PhysicsSystem, TransformSystem } from "./core/features/motion"
import { ConstraintSystem } from "./core/features/motion/constraints"

type Scenes = "rope"
export const engine = new Engine<Scenes>({
  systems: [
    new PhysicsSystem(),
    new ConstraintSystem(),
    new TransformSystem(),
    new AnimationSystem(),
    new GraphicsSystem(),
  ],
})

import { Engine } from "./core/engine"

type Scenes = "rope" | "collision"
export const engine = new Engine<Scenes>()

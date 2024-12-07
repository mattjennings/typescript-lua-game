import { GraphicsComponent } from "./components/graphics-component"
import { TransformComponent } from "./components/transform-component"
import { Engine } from "./engine/engine"
import { Entity } from "./engine/entity"
import { Scene } from "./engine/scene"
import { res } from "./res"
import { GraphicsSystem } from "./systems/graphics-system"

export const engine = new Engine({
  systems: [new GraphicsSystem()],
  types: {
    scenes: "level1",
  },
})

class Player extends Entity {
  constructor() {
    super()
    this.components.add(new GraphicsComponent(this, res.images.player))
    this.components.add(new TransformComponent(this, { x: 100, y: 100 }))
  }
}

class Level1 extends Scene {
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

import { Vec2 } from "src/core/features/math"
import { BodyComponent, TransformComponent } from "src/core/features/motion"
import { BoxCollider } from "src/core/features/motion/collider"
import { engine } from "src/engine"

function createBox(args: {
  static?: boolean
  position: Vec2
  width: number
  height: number
  color: [number, number, number]
}) {
  return engine
    .createEntity("box")
    .set({
      transform: new TransformComponent({ position: args.position }),
      body: new BodyComponent({
        static: args.static,
        // gravity: false,
        collider: new BoxCollider({ width: args.width, height: args.height }),
      }),
    })
    .self((self) => {
      // self.body.onCollision = (other) => {
      //   print("Collision detected")
      // }

      return self
        .on(self.body, "collision", (event) => {
          // print("Collision detected")
        })
        .onDraw(() => (
          <style
            translate={[self.transform.position.x, self.transform.position.y]}
            color={args.color}
          >
            <rectangle
              mode="fill"
              width={self.body.collider!.width}
              height={self.body.collider!.height}
            />
          </style>
        ))
    })
}

engine.registerScene("collision", (scene) =>
  scene.onStart(() => {
    const b1 = scene
      .addEntity(
        createBox({
          color: [0, 1, 1],
          position: new Vec2(100, 100),
          width: 50,
          height: 50,
        })
      )
      .onPreFixedUpdate(() => {
        const m = love.mouse.getPosition()
        if (love.keyboard.isDown("lshift")) {
          b1.transform.position.x = m[0]
          b1.transform.position.y = m[1]
        }
      })
    scene.addEntity(
      createBox({
        static: true,
        position: new Vec2(100, 200),
        width: 500,
        height: 50,
        color: [1, 0, 0],
      })
    )
  })
)

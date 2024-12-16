import { BodyComponent, TransformComponent } from "src/core/features/motion"
import { Vec2 } from "src/core/features/math"
import {
  ConstraintsComponent,
  RopeConstraint,
} from "src/core/features/motion/constraints"
import { engine } from "src/engine"
import { BoxCollider } from "src/core/features/motion/collider"

function createRope(args: {
  position: Vec2
  segments: number
  length: number
}) {
  const segmentDistance = args.length / args.segments - 1

  return engine
    .createEntity("rope")
    .set({
      transform: new TransformComponent({ position: args.position }),
      body: new BodyComponent({ static: true }),
    })
    .set({
      // disperse segments at most args.length from end to end
      segments: Array.from({ length: args.segments - 1 }, (_, i) => {
        return engine.createEntity(`rope-segment-${i}`).set({
          body: new BodyComponent({
            friction: new Vec2(0.9, 0.9),
            collider: new BoxCollider({ width: 4, height: 4 }),
          }),
          transform: new TransformComponent({
            position: args.position
              .clone()
              .add(new Vec2(0, (i + 1) * segmentDistance)),
          }),
        })
      }),
    })
    .self((rope) =>
      rope
        .addComponent(
          new ConstraintsComponent([
            new RopeConstraint([rope, ...rope.segments], segmentDistance),
          ])
        )
        .onAdd((scene) => {
          for (const segment of rope.segments) {
            scene.addEntity(segment)
          }
        })
        .onDestroy(() => {
          for (const segment of rope.segments) {
            segment.destroy()
          }
        })
        .onPreFixedUpdate(({ dt }) => {
          const mouse = love.mouse.getPosition()

          // rope.transform.position = new Vec2(mouse[0], mouse[1])
          // rope.segments[4].transform.position = new Vec2(mouse[0], mouse[1])
        })
        .onDraw(() => {
          love.graphics.setColor(0, 1, 0)
          love.graphics.circle("fill", args.position.x, args.position.y, 5)
          love.graphics.setColor(1, 1, 1)
          love.graphics.line(
            args.position.x,
            args.position.y,
            rope.segments[0].transform.position.x,
            rope.segments[0].transform.position.y
          )
          for (let i = 0; i < rope.segments.length; i++) {
            const p1 = rope.segments[i]
            const p2 = rope.segments[i + 1]

            if (!!p1) {
              love.graphics.setColor(1, 0, 0)
              love.graphics.circle(
                "fill",
                p1.transform.position.x,
                p1.transform.position.y,
                5
              )
            }
            love.graphics.setColor(1, 1, 1)

            if (!!p2) {
              love.graphics.line(
                p1.transform.position.x,
                p1.transform.position.y,
                p2.transform.position.x,
                p2.transform.position.y
              )

              if (i === args.segments - 2) {
                love.graphics.setColor(1, 0, 0)
                love.graphics.circle(
                  "fill",
                  p2.transform.position.x,
                  p2.transform.position.y,
                  5
                )
              }
              love.graphics.setColor(1, 1, 1)
            }
          }
        })
    )
}

engine.registerScene("rope", (scene) =>
  scene.onStart(() => {
    print("Rope scene started")

    scene.addEntity(
      createRope({ position: new Vec2(400, 100), segments: 25, length: 100 })
    )

    scene.addEntity(
      engine
        .createEntity("mouse")
        .set({
          transform: new TransformComponent({ position: new Vec2(0, 0) }),
          body: new BodyComponent({
            static: true,
            collider: new BoxCollider({ width: 100, height: 25 }),
          }),
        })
        .self((m) =>
          m
            .onFixedUpdate(() => {
              const mouse = love.mouse.getPosition()
              m.transform.position = new Vec2(mouse[0], mouse[1])
            })
            .onDraw(() => {
              love.graphics.setColor(1, 1, 1)
              love.graphics.rectangle(
                "fill",
                m.transform.position.x,
                m.transform.position.y,
                100,
                25
              )
            })
        )
    )
  })
)

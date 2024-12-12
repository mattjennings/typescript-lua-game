/* eslint-disable @typescript-eslint/no-use-before-define */
import * as lick from "lua/lick/lick"

// @ts-ignore
lick.reset = true
// @ts-ignore - enable if not using luaBundle
// lick.updateAllFiles = true

import { createPlayer } from "./src/entities/player"
import { engine } from "./src/engine"
import { BodyComponent, TransformComponent } from "src/core/features/motion"
import { Vec2 } from "src/core/features/math"

love.load = () => {
  class Level1 extends engine.Scene {
    points = [
      createPoint(100, 100, true),
      createPoint(150, 100),
      createPoint(200, 100),
      createPoint(250, 100),
      createPoint(300, 100),
    ]

    sticks = [
      createStick(this.points[0], this.points[1]),
      createStick(this.points[1], this.points[2]),
      createStick(this.points[2], this.points[3]),
      createStick(this.points[3], this.points[4]),
    ]
    constructor() {
      super()

      // const [x, y, width, height] = love.window.getSafeArea()

      // this.addEntity(createPlayer(100, 100))

      // // randomly create within safe area
      // for (let i = 0; i < 0; i++) {
      //   this.addEntity(
      //     createPlayer(
      //       love.math.random(x, width),
      //       love.math.random(y, height) + 10
      //     )
      //   )
      // }

      this.points.forEach((point) => this.addEntity(point))
      this.sticks.forEach((stick) => this.addEntity(stick))

      love.keypressed = (key) => {
        if (key === "space") {
          love.load()
        }
      }

      this.on("update", ({ dt }) => {
        const m = love.mouse.getPosition()

        if (m[0] && m[1]) {
          this.points[this.points.length - 1].transform.position.x = m[0]
          this.points[this.points.length - 1].transform.position.y = m[1]
        }

        for (let i = 0; i < 10; i++) {
          for (const stick of this.sticks) {
            const p1Vec = stick.p1.transform.position.clone()
            const p2Vec = stick.p2.transform.position.clone()

            const stickCenter = p1Vec.add(p2Vec).div(new Vec2(2, 2))
            const stickDir = p2Vec.sub(p1Vec).normalize()

            if (!stick.p1.locked) {
              stick.p1.transform.position.x =
                stickCenter.x - (stickDir.x * stick.length) / 2
              stick.p1.transform.position.y =
                stickCenter.y - (stickDir.y * stick.length) / 2
            }

            if (!stick.p2.locked) {
              stick.p2.transform.position.x =
                stickCenter.x + (stickDir.x * stick.length) / 2
              stick.p2.transform.position.y =
                stickCenter.y + (stickDir.y * stick.length) / 2
            }
          }
        }
      })
    }

    onStart(): void {
      print("Level1 started")
    }
  }

  engine.addScene("level1", Level1)
  engine.start({ scene: "level1" })
}

function createPoint(x: number, y: number, locked = false) {
  const point = new engine.Entity("point")
    .set({
      locked,
      transform: new TransformComponent({ position: { x, y } }),
      body: new BodyComponent({
        gravity: !locked,
        friction: 0.1,
      }),
    })
    .onUpdate(({ dt }) => {
      if (love.keyboard.isDown("left")) {
        point.transform.position.x -= 10
      }

      if (love.keyboard.isDown("right")) {
        point.transform.position.x += 10
      }
    })
    .onDraw(() => {
      love.graphics.setColor(1, 0, 0)
      love.graphics.circle(
        "fill",
        point.transform.position.x,
        point.transform.position.y,
        10
      )
      love.graphics.setColor(1, 1, 1)
    })

  return point
}

type Point = ReturnType<typeof createPoint>
function createStick(p1: Point, p2: Point, length = 40) {
  const stick = new engine.Entity("stick")
    .set({
      p1,
      p2,
      length,
      transform: new TransformComponent({
        position: p1.transform.position.clone(),
      }),
    })
    .onDraw(() => {
      love.graphics.setColor(1, 1, 1)
      love.graphics.line(
        p1.transform.position.x,
        p1.transform.position.y,
        p2.transform.position.x,
        p2.transform.position.y
      )
    })

  return stick
}

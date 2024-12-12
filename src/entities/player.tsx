// import { engine } from "src/engine"
// import {
//   AnimationComponent,
//   GraphicsComponent,
//   Spritesheet,
// } from "src/core/features/graphics"
// import { StateMachineComponent } from "src/core/features/state/state-machine"
// import { res } from "src/res"
// import { TransformComponent } from "src/core/features/motion"

// export function createPlayer(x: number, y: number) {
//   const spritesheet = new Spritesheet(res.images.player, {
//     width: 28,
//     height: 28,
//   })

//   const player = new engine.Entity("player")
//     .set({
//       SPEED: 100,
//       transform: new TransformComponent({ x, y, scale: 3 }),
//       graphic: new GraphicsComponent({ origin: [12, 0] }),
//       animation: new AnimationComponent({
//         spritesheet,
//         animations: {
//           idle: {
//             frameDuration: 0.32,
//             quads: spritesheet.getQuads(8),
//           },
//           run: {
//             frameDuration: 0.1,
//             quads: spritesheet.getQuads(0, 1, 2, 3),
//             loop: true,
//           },
//         },
//         initial: "idle",
//       }),
//       state: new StateMachineComponent({
//         types: {} as {
//           payloads: {
//             walk: { direction: "left" | "right" }
//             idle?: { direction?: "left" | "right" }
//           }
//           context: {
//             direction: "left" | "right"
//           }
//         },
//         context: { direction: "right" },
//         initial: "idle",
//         states: {
//           idle: {
//             enter: () => {
//               player.animation.play("idle")
//             },
//             on: {
//               walk: (payload, machine) => {
//                 machine.context.direction = payload.direction
//                 return "walk"
//               },
//             },
//           },
//           walk: {
//             enter: () => {
//               player.animation.play("run")
//             },
//             on: {
//               walk: (payload, machine) => {
//                 machine.context.direction = payload.direction
//                 return "walk"
//               },
//               idle: (payload, machine) => {
//                 if (payload?.direction) {
//                   machine.context.direction = payload.direction
//                 }
//                 return "idle"
//               },
//             },
//           },
//         },
//       }),
//     })
//     .onPreUpdate((args) => {
//       if (love.keyboard.isDown("left")) {
//         player.state.send("walk", { direction: "left" })
//       } else if (love.keyboard.isDown("right")) {
//         player.state.send("walk", { direction: "right" })
//       } else {
//         player.state.send("idle")
//       }
//     })
//     .onUpdate((args) => {
//       if (player.state.current === "walk") {
//         const speed = player.SPEED * args.dt
//         const direction = player.state.context.direction
//         const transform = player.transform
//         transform.x += direction === "left" ? -speed : speed
//         transform.scale = [direction === "left" ? -3 : 3, 3]
//       }
//     })
//     .onPostDraw(function () {
//       return (
//         <>
//           <style
//             color={[0, 1, 1]}
//             translate={[player.transform.x, player.transform.y]}
//           >
//             <print text={player.state.current} />
//             <style color={[1, 0, 1]} translate={[10, 100]}>
//               <print text={"123"} y={-10} />
//             </style>
//           </style>
//         </>
//       )
//     })

//   return player
// }

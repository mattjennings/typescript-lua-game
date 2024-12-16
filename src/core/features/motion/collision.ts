import type { SystemFixedUpdateFn, SystemQuery } from "src/core/system"
import { System } from "src/core/system"
import { BodyComponent, TransformComponent } from "../motion"
import { BoxCollider, type Collider } from "./collider"
import { type Entity } from "src/core/entity"
import { Vec2 } from "../math"

type Query = SystemQuery<[BodyComponent, TransformComponent]>
export class CollisionSystem extends System<Query> {
  query = [BodyComponent, TransformComponent] as const

  fixedUpdate: SystemFixedUpdateFn<Query> = (entities) => {
    let entitiesWithColliders: [
      Entity<[BodyComponent<Collider>], any, any>,
      BodyComponent<Collider>,
      TransformComponent
    ][] = []

    for (const [entity, [body, transform]] of entities) {
      if (body.collider) {
        entitiesWithColliders.push([entity as any, body as any, transform])
      }
    }

    for (let i = 0; i < entitiesWithColliders.length; i++) {
      const [aEntity, aBody, aTransform] = entitiesWithColliders[i]
      for (let j = i + 1; j < entitiesWithColliders.length; j++) {
        const [bEntity, bBody, bTransform] = entitiesWithColliders[j]

        if (
          aBody.collider!.intersects(
            aTransform.position,
            bTransform.position,
            bBody.collider!
          )
        ) {
          if (
            aBody.onCollisionResolve(bBody) &&
            bBody.onCollisionResolve(aBody)
          ) {
            aBody.emit("collision", { entity: bEntity, body: bBody })
            bBody.emit("collision", { entity: aEntity, body: aBody })

            // skip collision resolution
            if (aBody.static && bBody.static) {
              continue
            }

            if (
              aBody.collider instanceof BoxCollider &&
              bBody.collider instanceof BoxCollider
            ) {
              this.resolveBoxBoxCollision(
                { body: aBody, transform: aTransform },
                { body: bBody, transform: bTransform }
              )
            }
          }
        }
      }
    }
  }

  resolveBoxBoxCollision(
    a: { body: BodyComponent<BoxCollider>; transform: TransformComponent },
    b: { body: BodyComponent<BoxCollider>; transform: TransformComponent }
  ) {
    const aCollider = a.body.collider!
    const bCollider = b.body.collider!
    const mtv = this.getMTV(
      a.transform.position,
      aCollider,
      b.transform.position,
      bCollider
    )
    const direction = a.transform.position
      .clone()
      .sub(b.transform.position)
      .normalize()

    if (direction.dot(mtv) < 0) {
      mtv.negate()
    }

    if (!a.body.static) {
      a.transform.position.add(mtv.scale(b.body.static ? 1 : 0.5))

      if (mtv.x !== 0) {
        a.transform.prev.position.x = a.transform.position.x
      }
      if (mtv.y !== 0) {
        a.transform.prev.position.y = a.transform.position.y
      }
    }
    if (!b.body.static) {
      b.transform.position.sub(mtv.scale(a.body.static ? 1 : 0.5))

      if (mtv.x !== 0) {
        b.transform.prev.position.x = b.transform.position.x
      }

      if (mtv.y !== 0) {
        b.transform.prev.position.y = b.transform.position.y
      }
    }
  }

  // getHashKeys(position: Vec2, collider: Collider) {
  //   const gridSize = 100

  //   if (collider instanceof BoxCollider) {
  //     const min = collider.min().clone().add(position)
  //     const max = collider.max().clone().add(position)

  //     const minX = Math.floor(min.x / gridSize)
  //     const minY = Math.floor(min.y / gridSize)

  //     const maxX = Math.ceil(max.x / gridSize)
  //     const maxY = Math.ceil(max.y / gridSize)

  //     const keys = []

  //     for (let x = minX; x <= maxX; x += 1) {
  //       for (let y = minY; y <= maxY; y += 1) {
  //         keys.push(`${x},${y}`)
  //       }
  //     }

  //     return keys
  //   }

  //   throw new Error("Unsupported collider type")
  // }

  getMTV(p1: Vec2, box1: BoxCollider, p2: Vec2, box2: BoxCollider) {
    const min1 = new Vec2(p1.x, p1.y)
    const max1 = new Vec2(p1.x + box1.width, p1.y + box1.height)
    const min2 = new Vec2(p2.x, p2.y)
    const max2 = new Vec2(p2.x + box2.width, p2.y + box2.height)

    const x = Math.min(max1.x - min2.x, max2.x - min1.x)
    const y = Math.min(max1.y - min2.y, max2.y - min1.y)

    if (x < y) {
      return new Vec2(x, 0)
    } else {
      return new Vec2(0, y)
    }
  }
}

/*
      spatialHash.current.clear()

      const processedPairs = new Set<string>()

      // Populate the spatial hash with objects
      for (const [obj, physics] of objects.current) {
        if (!physics.collider) continue
        const keys = getHashKeys(physics.position, physics.collider)
        for (const key of keys) {
          if (!spatialHash.current.has(key)) {
            spatialHash.current.set(key, [])
          }
          spatialHash.current.get(key)!.push({ obj, physics })
        }
      }

      // Check for collisions within each cell
      const pairIds = ['', ''] // scratch array to avoid allocation

      for (const objects of spatialHash.current.values()) {
        for (let i = 0; i < objects.length; i++) {
          const physics1 = objects[i].physics
          for (let j = i + 1; j < objects.length; j++) {
            const physics2 = objects[j].physics

            if (physics1.collider && physics2.collider) {
              pairIds[0] = `${physics1.id},${physics2.id}`
              pairIds[1] = `${physics2.id},${physics1.id}`

              if (
                processedPairs.has(pairIds[0]) ||
                processedPairs.has(pairIds[1])
              ) {
                continue
              }
              resolveCollision(physics1, physics2)
              processedPairs.add(pairIds[0])
              processedPairs.add(pairIds[1])
            }
          }
        }
      }
        */

import { Component } from "src/core/component"
import { System, SystemFixedUpdateFn, SystemQuery } from "src/core/system"
import { TransformComponent } from "./transform"
import { BodyComponent } from "./body"
import { Entity, EntityWithComponent } from "src/core/entity"
import { Vec2 } from "../math"

export class ConstraintsComponent extends Component {
  constraints = new LuaSet<Constraint>()

  constructor(constraints: Constraint[]) {
    super()

    for (const constraint of constraints) {
      this.constraints.add(constraint)
    }
  }

  add(constraint: Constraint) {
    this.constraints.add(constraint)
  }

  remove(constraint: Constraint) {
    this.constraints.delete(constraint)
  }
}

export abstract class Constraint {
  iterations = 1

  apply(): void {
    for (let i = 0; i < this.iterations; i++) {
      this.applyOnce()
    }
  }

  protected abstract applyOnce: () => void
}

type Query = SystemQuery<[ConstraintsComponent]>

export class ConstraintSystem extends System<Query> {
  query = [ConstraintsComponent] as const

  fixedUpdate: SystemFixedUpdateFn<Query> = (entities) => {
    for (const [entity, [constraints]] of entities) {
      for (const constraint of constraints.constraints) {
        constraint.apply()
      }
    }
  }
}

export class DistanceConstraint extends Constraint {
  iterations = 1

  constructor(
    private entityA:
      | EntityWithComponent<[TransformComponent]>
      | EntityWithComponent<[TransformComponent, BodyComponent]>,
    private entityB:
      | EntityWithComponent<[TransformComponent]>
      | EntityWithComponent<[TransformComponent, BodyComponent]>,
    private distance: number
  ) {
    super()
  }

  applyOnce = () => {
    const aTransform = this.entityA.getComponent(TransformComponent)
    const bTransform = this.entityB.getComponent(TransformComponent)
    const aBody = this.entityA.getComponent(BodyComponent)
    const bBody = this.entityB.getComponent(BodyComponent)

    if (aBody?.static && bBody?.static) {
      return
    }

    const delta = bTransform.position.clone().sub(aTransform.position)

    const currentDistance = Math.sqrt(delta.x ** 2 + delta.y ** 2)
    const correctionFactor = (this.distance - currentDistance) / currentDistance

    if (aBody?.static) {
      bTransform.position.add(delta.clone().scale(correctionFactor))
    } else if (bBody?.static) {
      aTransform.position.sub(delta.clone().scale(correctionFactor))
    } else {
      const offset = delta.scale(0.5).clone().scale(correctionFactor)
      aTransform.position.sub(offset)
      bTransform.position.add(offset)
    }
  }
}

export class StickConstraint extends Constraint {
  constructor(
    private entityA:
      | EntityWithComponent<[TransformComponent]>
      | EntityWithComponent<[TransformComponent, BodyComponent]>,
    private entityB:
      | EntityWithComponent<[TransformComponent]>
      | EntityWithComponent<[TransformComponent, BodyComponent]>,
    private distance: number
  ) {
    super()
  }

  applyOnce = () => {
    const aTransform = this.entityA.getComponent(TransformComponent)
    const bTransform = this.entityB.getComponent(TransformComponent)
    const aBody = this.entityA.getComponent(BodyComponent)
    const bBody = this.entityB.getComponent(BodyComponent)
    const p1Vec = aTransform.position.clone()
    const p2Vec = bTransform.position.clone()

    const stickCenter = p1Vec.add(p2Vec).scale(0.5)
    const stickDir = p2Vec.sub(p1Vec).normalize()

    if (!aBody?.static) {
      aTransform.position.x = stickCenter.x - (stickDir.x * this.distance) / 2
      aTransform.position.y = stickCenter.y - (stickDir.y * this.distance) / 2
    }

    if (!bBody?.static) {
      bTransform.position.x = stickCenter.x + (stickDir.x * this.distance) / 2
      bTransform.position.y = stickCenter.y + (stickDir.y * this.distance) / 2
    }
  }
}

export class RopeConstraint extends Constraint {
  iterations = 30
  private constraints: Constraint[] = []

  constructor(
    entities: EntityWithComponent<[TransformComponent, BodyComponent]>[],
    segmentLength: number
  ) {
    super()
    for (let i = 0; i < entities.length - 1; i++) {
      this.constraints.push(
        new StickConstraint(entities[i], entities[i + 1], segmentLength)
      )
    }
  }

  applyOnce = () => {
    for (const constraint of this.constraints) {
      constraint.apply()
    }
  }
}

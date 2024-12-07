import { Image } from "love.graphics"
import { Component } from "src/engine/component"
import { Entity } from "src/engine/entity"

export class GraphicsComponent extends Component {
  static type = "graphics"

  image: Image

  constructor(entity: Entity, img: Image) {
    super(entity)
    this.image = img
  }
}

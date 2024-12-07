import { Image, Quad } from "love.graphics"

export class Spritesheet {
  image: Image
  width: number
  height: number

  quads: Quad[] = []

  constructor(
    image: Image,
    args: {
      width: number
      height: number
    }
  ) {
    this.image = image

    this.width = args.width
    this.height = args.height

    for (let y = 0; y < image.getHeight(); y += this.height) {
      for (let x = 0; x < image.getWidth(); x += this.width) {
        let quad = love.graphics.newQuad(
          x,
          y,
          this.width,
          this.height,
          image.getWidth(),
          image.getHeight()
        )
        this.quads.push(quad)
      }
    }
  }

  getQuads(...indexes: number[]): Quad[] {
    return indexes.map((index) => this.quads[index])
  }

  getQuadByPx(x: number, y: number): Quad {
    let xIndex = Math.floor(x / this.width)
    let yIndex = Math.floor(y / this.height)

    let index = yIndex * (this.image.getWidth() / this.width) + xIndex

    return this.quads[index]
  }
}

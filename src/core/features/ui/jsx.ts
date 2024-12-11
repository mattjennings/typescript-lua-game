/* eslint-disable @typescript-eslint/no-namespace */

import {
  AlignMode,
  ColouredText,
  CompareMode,
  Drawable,
  DrawMode,
  Mesh,
  Quad,
  Shader,
  Texture,
} from "love.graphics"
import { printTable } from "../debug/print"

export let drawQueue: Array<Function | undefined> = []

export function createElement(
  type: string | Function,
  props: Record<string, any> = {},
  children: number[] = []
) {
  if (typeof type === "function") {
    return type({ ...props, children })
  }

  switch (type) {
    case "arc": {
      let p = props as JSX.IntrinsicElements["arc"]
      drawQueue.push(() => {
        if (typeof p.segments === "number") {
          love.graphics.arc(
            p.mode,
            p.x ?? 0,
            p.y ?? 0,
            p.radius,
            p.angle1,
            p.angle2,
            p.segments
          )
        } else {
          love.graphics.arc(
            p.mode,
            p.x ?? 0,
            p.y ?? 0,
            p.radius,
            p.angle1,
            p.angle2
          )
        }
      })
      break
    }
    case "circle":
      {
        let p = props as JSX.IntrinsicElements["circle"]
        drawQueue.push(() => {
          if (typeof p.segments === "number") {
            love.graphics.circle(
              p.mode,
              p.x ?? 0,
              p.y ?? 0,
              p.radius,
              p.segments
            )
          } else {
            love.graphics.circle(p.mode, p.x ?? 0, p.y ?? 0, p.radius)
          }
        })
      }
      break

    case "draw": {
      let p = props as JSX.IntrinsicElements["draw"]
      drawQueue.push(() => {
        {
          if (p.quad) {
            love.graphics.draw(
              p.drawable as Texture,
              p.quad,
              p.x,
              p.y,
              p.r,
              p.sx,
              p.sy,
              p.ox,
              p.oy,
              p.kx,
              p.ky
            )
          } else {
            love.graphics.draw(
              p.drawable,
              p.x,
              p.y,
              p.r,
              p.sx,
              p.sy,
              p.ox,
              p.oy,
              p.kx,
              p.ky
            )
          }
        }
      })
      break
    }
    case "draw-instanced": {
      let p = props as JSX.IntrinsicElements["draw-instanced"]
      drawQueue.push(() => {
        love.graphics.drawInstanced(
          p.mesh,
          p.instancecount,
          p.x,
          p.y,
          p.r,
          p.sx,
          p.sy,
          p.ox,
          p.oy,
          p.kx,
          p.ky
        )
      })
      break
    }
    case "draw-layer": {
      let p = props as JSX.IntrinsicElements["draw-layer"]
      drawQueue.push(() => {
        if (p.quad) {
          love.graphics.drawLayer(
            p.texture,
            p.layerindex,
            p.quad,
            p.x,
            p.y,
            p.r,
            p.sx,
            p.sy,
            p.ox,
            p.oy,
            p.kx,
            p.ky
          )
        } else {
          love.graphics.drawLayer(
            p.texture,
            p.layerindex,
            p.x,
            p.y,
            p.r,
            p.sx,
            p.sy,
            p.ox,
            p.oy,
            p.kx,
            p.ky
          )
        }
      })
      break
    }
    case "ellipse": {
      let p = props as JSX.IntrinsicElements["ellipse"]
      drawQueue.push(() => {
        if (typeof p.segments === "number") {
          love.graphics.ellipse(
            p.mode,
            p.x ?? 0,
            p.y ?? 0,
            p.rx,
            p.ry,
            p.segments
          )
        } else {
          love.graphics.ellipse(p.mode, p.x ?? 0, p.y ?? 0, p.rx, p.ry)
        }
      })
      break
    }
    case "line": {
      let p = props as JSX.IntrinsicElements["line"]
      drawQueue.push(() => {
        love.graphics.line(...p.points)
      })
      break
    }
    case "polygon": {
      let p = props as JSX.IntrinsicElements["polygon"]
      drawQueue.push(() => {
        love.graphics.polygon(p.mode, p.xys)
      })
      break
    }

    case "print": {
      let p = props as JSX.IntrinsicElements["print"]
      drawQueue.push(() =>
        love.graphics.print(
          p.text,
          p.x,
          p.y,
          p.radius,
          p.sx,
          p.sy,
          p.ox,
          p.oy,
          p.kx,
          p.ky
        )
      )
      break
    }
    case "printf": {
      let p = props as JSX.IntrinsicElements["printf"]
      drawQueue.push(() =>
        love.graphics.printf(
          p.text,
          p.x ?? 0,
          p.y ?? 0,
          p.limit,
          p.align,
          p.r,
          p.sx,
          p.sy,
          p.ox,
          p.oy,
          p.kx,
          p.ky
        )
      )
      break
    }
    case "raw": {
      drawQueue.push(() => children)
      break
    }
    case "rectangle": {
      let p = props as JSX.IntrinsicElements["rectangle"]
      drawQueue.push(() => {
        if (typeof p.segments === "number") {
          love.graphics.rectangle(
            p.mode,
            p.x ?? 0,
            p.y ?? 0,
            p.width,
            p.height,
            p.rx ?? 1,
            p.ry,
            p.segments
          )
        } else {
          love.graphics.rectangle(
            p.mode,
            p.x ?? 0,
            p.y ?? 0,
            p.width,
            p.height,
            p.rx ?? 1,
            p.ry
          )
        }
      })
      break
    }
    case "style": {
      const {
        color,
        colorMask,
        filter,
        depthMode,
        font,
        frontFaceWind,
        lineJoin,
        lineStyle,
        lineWidth,
        meshCullMode,

        pointSize,
        scissor,
        shader,
        shear,
        stencilTest,
        wireFrame,
        translate,
        stencil,
      } = props as Omit<JSX.IntrinsicElements["style"], "children">

      const set = () => {
        love.graphics.push()
        if (color) {
          love.graphics.setColor(color)
        }

        if (colorMask) {
          love.graphics.setColorMask(...colorMask)
        }

        if (depthMode) {
          love.graphics.setDepthMode(...depthMode)
        }

        if (filter) {
          love.graphics.setDefaultFilter(...filter)
        }

        if (font) {
          love.graphics.setFont(props.font)
        }

        if (frontFaceWind) {
          love.graphics.setFrontFaceWinding(frontFaceWind)
        }

        if (lineJoin) {
          love.graphics.setLineJoin(lineJoin)
        }

        if (lineStyle) {
          love.graphics.setLineStyle(lineStyle)
        }

        if (lineWidth) {
          love.graphics.setLineWidth(lineWidth)
        }

        if (meshCullMode) {
          love.graphics.setMeshCullMode(meshCullMode)
        }

        if (pointSize) {
          love.graphics.setPointSize(pointSize)
        }

        if (scissor) {
          love.graphics.setScissor(...scissor)
        }

        if (shader) {
          love.graphics.setShader(shader)
        }

        if (shear) {
          love.graphics.shear(...shear)
        }

        if (stencilTest) {
          love.graphics.setStencilTest(...stencilTest)
        }

        if (wireFrame) {
          love.graphics.setWireframe(wireFrame)
        }

        if (translate) {
          love.graphics.translate(...translate)
        }

        if (stencil) {
          love.graphics.stencil(...stencil)
        }
      }

      const reset = () => {
        love.graphics.pop()
        love.graphics.reset()
      }

      // unsure why but only 1 child is in this array. but it seems we can rely
      // on it being the start and drawQueue.length being the end at this point in the render
      const queueStart = children[0]
      const queueEnd = drawQueue.length

      if (queueStart >= 0) {
        drawQueue.splice(queueStart, 0, set)
        drawQueue.splice(queueEnd + 1, 0, reset)
      }
    }
  }

  const ln = drawQueue.length > 0 ? drawQueue.length - 1 : 0

  if (children.length > 0) {
    return [ln, ...children]
  }

  return [ln]
}

export function Fragment(props: any) {
  return props.children
}

declare global {
  namespace JSX {
    type Element = any

    interface IntrinsicElements {
      arc: {
        mode: "fill" | "line"
        x?: number
        y?: number
        radius: number
        angle1: number
        angle2: number
        segments?: number
      }

      circle: {
        mode: "fill" | "line"
        x?: number
        y?: number
        radius: number
        segments?: number
      }

      draw: {
        drawable: Drawable
        quad?: Quad
        x?: number
        y?: number
        r?: number
        sx?: number
        sy?: number
        ox?: number
        oy?: number
        kx?: number
        ky?: number
      }

      "draw-instanced": {
        mesh: Mesh
        instancecount: number
        x?: number
        y?: number
        r?: number
        sx?: number
        sy?: number
        ox?: number
        oy?: number
        kx?: number
        ky?: number
      }

      "draw-layer": {
        texture: Texture
        layerindex: number
        quad?: Quad
        x?: number
        y?: number
        r?: number
        sx?: number
        sy?: number
        ox?: number
        oy?: number
        kx?: number
        ky?: number
      }

      ellipse: {
        mode: DrawMode
        x?: number
        y?: number
        rx: number
        ry: number
        segments?: number
      }

      line: {
        points: number[]
      }

      polygon: {
        mode: DrawMode
        xys: Array<number>
      }

      print: {
        text: string
        x?: number
        y?: number
        radius?: number
        sx?: number
        sy?: number
        ox?: number
        oy?: number
        kx?: number
        ky?: number
      }
      printf: {
        text: string | ColouredText
        x?: number
        y?: number
        limit: number
        align?: AlignMode
        r?: number
        sx?: number
        sy?: number
        ox?: number
        oy?: number
        kx?: number
        ky?: number
      }
      raw: { children: () => void }
      rectangle: {
        mode: DrawMode
        x?: number
        y?: number
        width: number
        height: number
        rx?: number
        ry?: number
        segments?: number
      }
      style: {
        color?: Parameters<typeof love.graphics.setColor>[0]
        colorMask?: Parameters<typeof love.graphics.setColorMask>
        filter?: Parameters<typeof love.graphics.setDefaultFilter>
        depthMode?: Parameters<typeof love.graphics.setDepthMode>
        font?: Parameters<typeof love.graphics.setFont>[0]
        frontFaceWind?: Parameters<typeof love.graphics.setFrontFaceWinding>[0]
        lineJoin?: Parameters<typeof love.graphics.setLineJoin>[0]
        lineStyle?: Parameters<typeof love.graphics.setLineStyle>[0]
        lineWidth?: Parameters<typeof love.graphics.setLineWidth>[0]
        meshCullMode?: Parameters<typeof love.graphics.setMeshCullMode>[0]
        shader?: Shader
        pointSize?: Parameters<typeof love.graphics.setPointSize>[0]
        scissor?: [x: number, y: number, width: number, height: number]
        stencilTest?: [comparemode: CompareMode, comparevalue: number]
        wireFrame?: boolean
        shear?: [kx: number, ky: number]
        stencil?: Parameters<typeof love.graphics.stencil>
        translate?: [x: number, y: number]
        children?: JSX.Element | JSX.Element[]
      }

      // [key: string]: any
    }
  }
}

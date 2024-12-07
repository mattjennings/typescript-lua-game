import * as ts from "typescript"
import * as tstl from "typescript-to-lua"
import * as fs from "fs"

let copied = false

const plugin: tstl.Plugin = {
  beforeTransform(
    program: ts.Program,
    options: tstl.CompilerOptions,
    emitHost: tstl.EmitHost
  ) {
    if (!copied) {
      copied = true
      if (fs.existsSync("dist/res")) {
        fs.rmSync("dist/res", { recursive: true })
      }

      fs.mkdirSync("dist/res", { recursive: true })
      fs.cpSync("res", "dist/res", { recursive: true })
    }
  },
}

export default plugin

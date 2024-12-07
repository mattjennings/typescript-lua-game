// lua modules
declare module "*.lua" {
  const v: any
  export default v
}

declare module "lua/lick/lick"

// lua functions
declare const print: (format: string, ...args: any[]) => void

// ?
declare const vec2: (x: number, y: number) => any

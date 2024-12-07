export interface ConstructorOf<T> {
  new (...args: any[]): T
}

export type LoveUpdateFn = (dt: number) => void

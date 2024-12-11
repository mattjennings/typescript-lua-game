/* eslint-disable no-var */
import * as UI from "./jsx"

declare global {
  export const __UI: typeof UI
}

declare var __UI: typeof UI

__UI = UI

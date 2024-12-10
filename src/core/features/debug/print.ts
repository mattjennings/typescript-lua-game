export function printTable(obj: Record<string, any>, depth = 1, prefix = "") {
  for (const [key, value] of pairs(obj)) {
    if (typeof value === "object" && depth > 0) {
      print(`[${key}] ${value}`)
      printTable(value, depth - 1, prefix + "  ")
    } else {
      print(`${prefix}[${key}] ${value}`)
    }
  }
}

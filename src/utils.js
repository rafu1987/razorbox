export function numberInRange (value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function contentDuration (value) {
  const ms = Number(value)
  return Number.isFinite(ms) ? numberInRange(ms, 0, 2000) : 300
}

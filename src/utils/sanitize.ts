/**
 * Recursively removes `undefined` values from objects and arrays.
 * Firebase Realtime Database rejects writes that contain `undefined`, so
 * sanitize every payload before sending it to Firestore/RTDB.
 *
 * Mutates and returns the same object (uses `delete` on object keys).
 */
export function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach((item) => removeUndefined(item))
    return value
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      const child = (value as Record<string, unknown>)[key]
      if (child === undefined) {
        delete (value as Record<string, unknown>)[key]
      } else if (typeof child === 'object') {
        removeUndefined(child)
      }
    }
  }
  return value
}

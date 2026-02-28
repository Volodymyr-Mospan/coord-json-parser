export function flattenCoords(coords) {
  const res = [];
  (function walk(c) {
    if (!Array.isArray(c)) return;
    if (c.length && typeof c[0] === "number") {
      res.push(c);
    } else {
      c.forEach((item, i) => {
        if (i === 0 || !deepEqual(item, c[0])) walk(item);
      });
    }
  })(coords);
  return res;
}

export function deepEqual(a, b) {
  if (a === b) return true;

  if (a == null || typeof a != "object" || b == null || typeof b != "object")
    return false;

  let keysA = Object.keys(a),
    keysB = Object.keys(b);

  if (keysA.length != keysB.length) return false;

  for (let key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }

  return true;
}

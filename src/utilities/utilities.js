export function flattenCoords(coords) {
  const res = [];

  (function walk(c) {
    if (!Array.isArray(c)) return;

    // Старий формат [lat, lng]
    if (c.length === 2 && typeof c[0] === "number") {
      res.push(c);
      return;
    }

    // Новий формат {lat, lng}
    if (c.length && typeof c[0] === "object" && "lat" in c[0]) {
      c.forEach(({ lat, lng }) => {
        res.push([lat, lng]);
      });
      return;
    }

    c.forEach(walk);
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

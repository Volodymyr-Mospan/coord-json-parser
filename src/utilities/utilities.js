export function flattenCoords(coords) {
  const res = [];
  (function walk(c) {
    if (!Array.isArray(c)) return;
    if (c.length && typeof c[0] === "number") {
      res.push(c);
    } else {
      for (const item of c) walk(item);
    }
  })(coords);
  return res;
}

export function createNXYH(coordArray, starterNum, isXY) {
  const coordLength = coordArray.length;
  if (!coordArray || !coordLength) {
    return "";
  }

  if (deepEqual(coordArray[0], coordArray[coordLength - 1])) {
    coordArray.pop();
  }

  return coordArray
    .map((point, i) => {
      const x = point[isXY ? 1 : 0];
      const y = point[isXY ? 0 : 1];
      const z = point[2] ? point[2] : "0.00";
      return `${starterNum + i}, ${x}, ${y}, ${z}`;
    })
    .join("\n");
}

function deepEqual(a, b) {
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

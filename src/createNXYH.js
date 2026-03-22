import { deepEqual } from "./utilities/utilities";

export function createNXYH(coordArray, starterNum, isXY) {
  if (!coordArray || !coordArray.length) {
    return [];
  }

  const coords = deepEqual(coordArray[0], coordArray[coordArray.length - 1])
    ? coordArray.slice(0, -1)
    : coordArray;

  return coords.map((point, i) => {
    const x = point[isXY ? 1 : 0].toFixed(3);
    const y = point[isXY ? 0 : 1].toFixed(3);
    const z = point[2] ? point[2] : "0.00";
    return `${starterNum + i}, ${x}, ${y}, ${z}`;
  });
}

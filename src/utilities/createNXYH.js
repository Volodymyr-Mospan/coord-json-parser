export function createNXYH(coordArray, starterNum, isXY) {
  if (!coordArray || !coordArray.length) {
    return [];
  }

  const first = coordArray[0];
  const last = coordArray[coordArray.length - 1];
  const isClosed = first[0] === last[0] && first[1] === last[1];
  const coords = isClosed ? coordArray.slice(0, -1) : coordArray;

  return coords.map((point, i) => {
    const x = point[isXY ? 1 : 0].toFixed(3);
    const y = point[isXY ? 0 : 1].toFixed(3);
    const z = point[2] ? point[2] : "0.00";
    return `${starterNum + i}, ${x}, ${y}, ${z}`;
  });
}

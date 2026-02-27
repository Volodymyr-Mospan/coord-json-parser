import { createNXYH } from "./createNXYH.js";

export function fileProcessing(file, coordSys, output, isXY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const jsonData = JSON.parse(e.target.result);
        const coordArray = flattenCoords(jsonData.coordinates);

        coordSys.textContent = `Система координат - ${jsonData.properties.coordSys}`;
        output.textContent = createNXYH(
          coordArray,
          Number(firstNum.value),
          isXY,
        );

        resolve(coordArray); // повертаємо jsonData
      } catch (err) {
        console.error("Помилка парсингу JSON:", err);
        coordSys.textContent =
          "Помилка парсингу JSON, ймовірно файл не відповідає файлу координат";
        coordSys.style.color = "red";
        reject(err);
      }
    };

    reader.readAsText(file);
  });
}

function flattenCoords(coords) {
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

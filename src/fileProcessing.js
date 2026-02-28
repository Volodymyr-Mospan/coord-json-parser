import { createNXYH } from "./createNXYH.js";
import { flattenCoords } from "./utilities/utilities.js";

export function fileProcessing(file, coordSys, output, isXY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const jsonData = JSON.parse(e.target.result);
        const flatCoordArray = flattenCoords(jsonData.coordinates);
        const multiPolygon = jsonData.coordinates;

        coordSys.textContent = `Система координат - ${jsonData.properties.coordSys}`;
        output.textContent = createNXYH(
          flatCoordArray,
          Number(firstNum.value),
          isXY,
        );

        resolve({ flatCoordArray, multiPolygon }); // повертаємо jsonData
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

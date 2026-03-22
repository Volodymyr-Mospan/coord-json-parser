import { createNXYH } from "./createNXYH.js";
import { sk63ToWgs84 } from "./sc_63_to_WGS/transformFunctions.js";
import { flattenCoords, getFilenameFromFile } from "./utilities/utilities.js";

export async function processAllFiles({
  firstNum,
  output,
  files,
  coordSys,
  isXY,
}) {
  if (!files.length) return { allWgsArrays: [], coordsNXYH: [] };

  const firstNumberVal = Number(firstNum.value);
  const allWgsArrays = [];
  const coordsNXYH = [];

  for (const file of files) {
    try {
      let fromNumber = firstNumberVal + coordsNXYH.length;

      const { multiPolygon, arrayNXYH } = await fileProcessing({
        file,
        coordSys,
        isXY,
        fromNumber,
      });

      const wgsArray = sk63ToWgs84(multiPolygon);
      coordsNXYH.push(...arrayNXYH);
      allWgsArrays.push({
        name: getFilenameFromFile(file),
        wgsArray,
      });
    } catch (err) {
      console.error("Помилка файлу:", file.name, err);
    }
  }

  output.textContent = coordsNXYH.join("\n");
  return { allWgsArrays, coordsNXYH };
}

export function fileProcessing({ file, coordSys, isXY, fromNumber }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const jsonData = JSON.parse(e.target.result);
        const flatCoordArray = flattenCoords(jsonData.coordinates);
        const multiPolygon = jsonData.coordinates;

        coordSys.textContent = `Система координат - ${jsonData.properties.coordSys}`;
        const arrayNXYH = createNXYH(flatCoordArray, fromNumber, isXY);

        resolve({ arrayNXYH, flatCoordArray, multiPolygon }); // повертаємо jsonData
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

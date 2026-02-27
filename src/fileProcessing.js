import { createNXYH } from "./createNXYH.js";

export function fileProcessing(file, coordSys, output, isXY) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      // console.log("JSON-об'єкт:", jsonData);
      coordSys.textContent = `Система координат - ${jsonData.properties.coordSys}`;
      output.textContent = createNXYH(jsonData, Number(firstNum.value), isXY);
    } catch (err) {
      console.error("Помилка парсингу JSON:", err);
      coordSys.textContent =
        "Помилка парсингу JSON:, ймовірно файл не відповідає файлу координат";
      coordSys.style.color = "red";
    }
  };
  reader.readAsText(file);
}

import "./style.css";
import { saveAs } from "file-saver";

const fileInput = document.getElementById("fileInput");
const coordSys = document.querySelector(".coordinate_system");
const firstNum = document.getElementById("firstNum");
const output = document.getElementById("output");
const changeXYBtn = document.getElementById("changeXYBtn");
const saveBtn = document.getElementById("saveBtn");

let file;
let isXY = true;

fileInput.addEventListener("change", onReadFile);
firstNum.addEventListener("change", onChangeNumber);
changeXYBtn.addEventListener("click", onChangeXYBtn);
saveBtn.addEventListener("click", onSaveBtn);

function onReadFile(e) {
  file = e.target.files[0];
  if (!file) return;

  coordSys.style.color = "inherit";
  coordSys.style.display = "block";
  changeXYBtn.style.display = "block";
  saveBtn.style.display = "block";

  fileProcessing(file);
}

function onChangeNumber() {
  if (!file) return;
  fileProcessing(file);
}

function onChangeXYBtn() {
  isXY = isXY ? false : true;
  if (!file || !confirm("Змінити X та Y місцями?")) return;

  fileProcessing(file);
}

function onSaveBtn() {
  saveAs(
    new Blob([output.textContent]),
    `${file.name.slice(0, file.name.indexOf("."))}.txt`
  );
}

function fileProcessing(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      // console.log("JSON-об'єкт:", jsonData);
      coordSys.textContent = `Система координат - ${jsonData.properties.coordSys}`;
      output.textContent = createNXYH(jsonData, Number(firstNum.value));
    } catch (err) {
      console.error("Помилка парсингу JSON:", err);
      coordSys.textContent =
        "Помилка парсингу JSON:, ймовірно файл не відповідає файлу координат";
      coordSys.style.color = "red";
    }
  };
  reader.readAsText(file);
}

function createNXYH(coordJSON, starterNum) {
  const coodrArray = coordJSON.coordinates[0][0];

  if (!coodrArray) {
    return;
  }

  return coodrArray.reduce((acc, point, i, arr) => {
    return (acc += `${starterNum + i}, ${point[isXY ? 1 : 0]}, ${
      point[isXY ? 0 : 1]
    }, ${point[2] ? point[2] : "0.00"}${i === arr.length - 1 ? "" : "\n"}`);
  }, "");
}

// setupCounter(document.querySelector('#counter'))
// const jsonStructure = {
//   type: "MultiPolygon",
//   coordinates: [
//     [
//       [
//         [3366088.8250000002, 5599893.7199999997],
//         [3366096.8700000001, 5599890.7800000003],
//       ],
//     ],
//   ],
//   properties: { coordSys: "SC63" },
// };

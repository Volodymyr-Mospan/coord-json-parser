import "./style.css";
import { saveAs } from "file-saver";
import { sk63ToWgs84 } from "./sc63toWGS/sc63zone4toWGS.js";
// const point = wgs84ToSk63(50.368738, 31.327039);
// const point = sk63ToWgs84(5573426.02, 4216638.92);
const point = sk63ToWgs84(5469006.974, 4267842.221);
console.log(point);

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
    `${file.name.slice(0, file.name.indexOf("."))}.txt`,
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

  const coordArray = flattenCoords(coordJSON.coordinates);
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

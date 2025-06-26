// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'
import "./style.css";

import { saveAs } from "file-saver";
const fileInput = document.getElementById("fileInput");
const firstNum = document.getElementById("firstNum");
const output = document.getElementById("output");
const saveBtn = document.getElementById("saveBtn");
let file;

fileInput.addEventListener("change", onReadFile);
firstNum.addEventListener("change", onChangeNumber);
saveBtn.addEventListener("click", onClick);

function onReadFile(e) {
  file = e.target.files[0];
  if (!file) return;

  saveBtn.style.display = "block";

  fileProcessing(file);
}

function onChangeNumber() {
  if (!file) return;
  fileProcessing(file);
}

function onClick() {
  saveAs(
    new Blob([output.textContent]),
    file.name.slice(0, file.name.indexOf("."))
  );
}

function fileProcessing(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      // console.log("JSON-об'єкт:", jsonData);
      output.textContent = createNXYH(jsonData, Number(firstNum.value));
    } catch (err) {
      console.error("Помилка парсингу JSON:", err);
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
    return (acc += `${starterNum + i}, ${point[1]}, ${point[0]}, ${
      point[2] ? point[2] : "0.00"
    }${i === arr.length - 1 ? "" : "\n"}`);
  }, "");
}

// setupCounter(document.querySelector('#counter'))

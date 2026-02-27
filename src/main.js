import "./style.css";
import { saveAs } from "file-saver";
import { fileProcessing } from "./fileProcessing.js";
import { createMap } from "./maps/leaflet/leaflet.js";
import { sk63ToWgs84 } from "./sc63toWGS/sc63zone4toWGS.js";

const fileInput = document.getElementById("fileInput");
const coordSys = document.querySelector(".coordinate_system");
const output = document.getElementById("output");
const firstNum = document.getElementById("firstNum");
const changeXYBtn = document.getElementById("changeXYBtn");
const saveBtn = document.getElementById("saveBtn");

let file;
let isXY = true;
let parsedJSONCoord = null;

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

  fileProcessing(file, coordSys, output, isXY)
    .then((coordArray) => {
      const wgsArray = sk63ToWgs84(coordArray);

      const averegWGS = wgsArray.reduce(([latAcc, lonAcc], [lat, lon], i) => {
        if (i < wgsArray.length - 1) return [latAcc + lat, lonAcc + lon];
        return [
          (latAcc + lat) / wgsArray.length,
          (lonAcc + lon) / wgsArray.length,
        ];
      });

      createMap(averegWGS, wgsArray);
    })
    .catch((err) => {
      parsedJSONCoord = null;
    });
}

function onChangeNumber() {
  if (!file) return;
  fileProcessing(file, coordSys, output, isXY);
}

function onChangeXYBtn() {
  isXY = isXY ? false : true;
  if (!file || !confirm("Змінити X та Y місцями?")) return;

  fileProcessing(file, coordSys, output, isXY);
}

function onSaveBtn() {
  saveAs(
    new Blob([output.textContent]),
    `${file.name.slice(0, file.name.indexOf("."))}.txt`,
  );
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

import "./style.css";
import { saveAs } from "file-saver";
import { fileProcessing } from "./fileProcessing.js";
import { createMap } from "./maps/leaflet/leaflet.js";
import { sk63ToWgs84 } from "./sc63toWGS/transformFunctions.js";
import { flattenCoords } from "./utilities/utilities.js";

const fileInput = document.getElementById("fileInput");
const coordSys = document.querySelector(".coordinate_system");
const coordOfArea = document.querySelector(".coordinate_of_area");
const output = document.getElementById("output");
const firstNum = document.getElementById("firstNum");
const copyBtn = document.getElementById("copyCoords");
const changeXYBtn = document.getElementById("changeXYBtn");
const saveBtn = document.getElementById("saveBtn");
const displayAtributes = document.querySelectorAll('[data-js="display"]');

let file;
let isXY = true;

fileInput.addEventListener("change", onReadFile);
copyBtn.addEventListener("click", onCopyBtn);
firstNum.addEventListener("change", onChangeNumber);
changeXYBtn.addEventListener("click", onChangeXYBtn);
saveBtn.addEventListener("click", onSaveBtn);

function onReadFile(e) {
  file = e.target.files[0];
  if (!file) return;

  coordSys.style.color = "inherit";
  displayAtributes.forEach((el) => (el.style.display = "block"));

  fileProcessing(file, coordSys, output, isXY)
    .then(({ multiPolygon }) => {
      let wgsArray = sk63ToWgs84(multiPolygon);
      const flattenWGSArray = flattenCoords(wgsArray);

      const averegWGS = flattenWGSArray.reduce(
        ([latAcc, lonAcc], [lat, lon], i) => {
          if (i < flattenWGSArray.length - 1)
            return [latAcc + lat, lonAcc + lon];
          return [
            (latAcc + lat) / flattenWGSArray.length,
            (lonAcc + lon) / flattenWGSArray.length,
          ];
        },
      );

      coordOfArea.textContent = averegWGS
        .map((coord) => coord.toFixed(8))
        .join(", ");

      createMap(averegWGS, wgsArray);
    })
    .catch((err) => {
      parsedJSONCoord = null;
    });
}

async function onCopyBtn() {
  const text = coordOfArea.textContent;
  const [lat, lng] = coordOfArea.textContent.split(", ");

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
  copyBtn.textContent = "Скопійовано!";

  setTimeout(() => {
    copyBtn.textContent = "Копі";
  }, 1500);

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isIOS) {
    window.location.href = `https://waze.com/ul?ll=${lat},${lng}`;
  } else if (isAndroid) {
    // дає вибір навігатора
    window.location.href = `geo:0,0?q=${lat},${lng}`;
  } else {
    // fallback (ПК)
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank",
    );
  }
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
//       [
//         [3366088.8250000002, 5599893.7199999997],
//         [3366096.8700000001, 5599890.7800000003],
//       ],
//     ],
//   ],
//   properties: { coordSys: "SC63" },
// };

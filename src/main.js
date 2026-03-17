import "./style.css";
import { saveAs } from "file-saver";
import { fileProcessing } from "./fileProcessing.js";
import {
  // centerMapOnUser,
  drawMultiPolygon,
  fitBoundsMulti,
  initMap,
  startWatchingLocation,
  stopWatchingLocation,
} from "./maps/google_maps/google_maps.js";
import { sk63ToWgs84 } from "./sc_63_to_WGS/transformFunctions.js";
import { flattenCoords, getFilenameFromFile } from "./utilities/utilities.js";
import { downloadKML, gmPathsToKML } from "./utilities/saveKML.js";

const fileInput = document.getElementById("fileInput");
const coordSys = document.querySelector(".coordinate_system");
const coordOfArea = document.querySelector(".coordinate_of_area");
const output = document.getElementById("output");
const firstNum = document.getElementById("firstNum");
const copyBtn = document.getElementById("copyCoords");
const changeXYBtn = document.getElementById("changeXYBtn");
const saveBtn = document.getElementById("saveBtn");
const saveKMLBtn = document.getElementById("saveKMLBtn");
const displayAtributes = document.querySelectorAll('[data-js="display"]');
const showMyLocationBtn = document.getElementById("showMyLocation");
const centerOnMeBtn = document.getElementById("centerOnMe");
const centerOnAreaBtn = document.getElementById("centerOnArea");

let file;
let isXY = true;
let wgsArray;
let flattenWGSArray;
let averageWGS;
let mapG;

fileInput.addEventListener("change", onReadFile);
copyBtn.addEventListener("click", onCopyBtn);
firstNum.addEventListener("change", onChangeNumber);
changeXYBtn.addEventListener("click", onChangeXYBtn);
saveBtn.addEventListener("click", onSaveBtn);
saveKMLBtn.addEventListener("click", onSaveKMLBtn);
showMyLocationBtn.addEventListener("click", onShowMyLocationBtn);
centerOnMeBtn.addEventListener("click", onCenterOnMeBtn);
centerOnAreaBtn.addEventListener("click", onCenterOnAreaBtn);

function onReadFile(e) {
  file = e.target.files[0];
  if (!file) return;

  coordSys.style.color = "inherit";
  displayAtributes.forEach((el) => (el.style.display = "block"));

  fileProcessing(file, coordSys, output, isXY)
    .then(({ multiPolygon }) => {
      wgsArray = sk63ToWgs84(multiPolygon);
      flattenWGSArray = flattenCoords(wgsArray);

      averageWGS = flattenWGSArray.reduce(([latAcc, lonAcc], [lat, lon], i) => {
        if (i < flattenWGSArray.length - 1) return [latAcc + lat, lonAcc + lon];
        return [
          (latAcc + lat) / flattenWGSArray.length,
          (lonAcc + lon) / flattenWGSArray.length,
        ];
      });

      coordOfArea.textContent = averageWGS
        .map((coord) => coord.toFixed(8))
        .join(", ");

      initMap().then((map) => {
        mapG = map;
        drawMultiPolygon(wgsArray, flattenWGSArray, Number(firstNum.value));
      });
    })
    .catch((err) => {
      console.log(err);
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
    copyBtn.textContent = "Копі / Навігація";
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
  fileProcessing(file, coordSys, output, isXY).then(() => {
    drawMultiPolygon(wgsArray, flattenWGSArray, Number(firstNum.value));
  });
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

function onSaveKMLBtn() {
  const filename = getFilenameFromFile(file);
  const kml = gmPathsToKML(wgsArray, filename);
  downloadKML(kml, filename);
}

function onShowMyLocationBtn() {
  if (mapG) startWatchingLocation();
  else alert("Спершу ініціалізуй карту!");
  showMyLocationBtn.style.display = "none";
  centerOnAreaBtn.style.display = "block";
}

function onCenterOnMeBtn() {
  startWatchingLocation();
  // centerMapOnUser();
  centerOnMeBtn.style.display = "none";
  centerOnAreaBtn.style.display = "block";
}

function onCenterOnAreaBtn() {
  stopWatchingLocation();
  fitBoundsMulti(wgsArray);
  centerOnAreaBtn.style.display = "none";
  centerOnMeBtn.style.display = "block";
}

//   type: "MultiPolygon",
//   coordinates: [
//     [
//       [
//         [3366088.8250000002, 5599893.7199999997],
//         [3366096.8700000001, 5599890.7800000003],
//       ],
//       [
//         [3366080.8250000002, 5599893.7199999997],
//         [33660974.8700000001, 5599890.7800000003],
//       ],
//     ],
//   ],
//   properties: { coordSys: "SC63" },
// };

document.addEventListener(
  "wheel",
  function (e) {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false },
);

document.addEventListener(
  "touchmove",
  function (e) {
    if (e.scale !== undefined && e.scale !== 1) {
      e.preventDefault();
    }
  },
  { passive: false },
);

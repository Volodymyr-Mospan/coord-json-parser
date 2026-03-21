import "./style.css";
import { saveAs } from "file-saver";
import { fileProcessing, processAllFiles } from "./fileProcessing.js";
import {
  drawAllPolygons,
  fitBoundsMulti,
  initMap,
  startWatchingLocation,
  stopWatchingLocation,
} from "./maps/google_maps/google_maps.js";
import { flattenCoords } from "./utilities/utilities.js";
import { downloadKML, multipleToKML } from "./utilities/saveKML.js";

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
let files = [];
let allWgsArrays = [];
let isXY = true;
let firstArrayWGS;
let flattenWGSArray;
let averageWGS;
let mapG;
let lastNumber;
let coordsNXYH = [];

fileInput.addEventListener("change", onReadFile);
copyBtn.addEventListener("click", onCopyBtn);
firstNum.addEventListener("change", onChangeNumber);
changeXYBtn.addEventListener("click", onChangeXYBtn);
saveBtn.addEventListener("click", onSaveBtn);
saveKMLBtn.addEventListener("click", onSaveKMLBtn);
showMyLocationBtn.addEventListener("click", onShowMyLocationBtn);
centerOnMeBtn.addEventListener("click", onCenterOnMeBtn);
centerOnAreaBtn.addEventListener("click", onCenterOnAreaBtn);

async function onReadFile(e) {
  if (!e.target.files.length) return;

  files = Array.from(e.target.files);

  displayAtributes.forEach((el) => (el.style.display = "block"));

  allWgsArrays = await processAllFiles({
    firstNum,
    coordsNXYH,
    lastNumber,
    output,
    files,
    coordSys,
    isXY,
  });

  // центр карти
  if (allWgsArrays.length) {
    firstArrayWGS = allWgsArrays[0].wgsArray;

    flattenWGSArray = flattenCoords(firstArrayWGS);

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

    if (!mapG) {
      mapG = await initMap();
    }

    drawAllPolygons(allWgsArrays, lastNumber);
    fitBoundsMulti(firstArrayWGS);
  }
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

async function onChangeNumber() {
  await processAllFiles({
    firstNum,
    coordsNXYH,
    lastNumber,
    output,
    files,
    coordSys,
    isXY,
  });
}

function onChangeXYBtn() {
  isXY = isXY ? false : true;
  if (!file || !confirm("Змінити X та Y місцями?")) return;

  fileProcessing(file, coordSys, output, isXY);
}

function onSaveBtn() {
  if (!allWgsArrays.length) return;

  if (allWgsArrays.length === 1) {
    return saveAs(
      new Blob([output.textContent]),
      `${allWgsArrays[0].name.slice(0, allWgsArrays[0].name.indexOf("."))}.txt`,
    );
  }
  saveAs(new Blob([output.textContent]), "combined.txt");
}

function onSaveKMLBtn() {
  if (!allWgsArrays.length) return;
  const kml = multipleToKML(allWgsArrays);
  if (allWgsArrays.length === 1) {
    return downloadKML(kml, allWgsArrays[0].name);
  }
  downloadKML(kml, "combined");
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
  fitBoundsMulti(firstArrayWGS);
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

// async function processAllFiles() {
//   if (!files.length) return;

//   firstNumberVal = Number(firstNum.value);
//   allWgsArrays = [];
//   coordsNXYH = [];
//   lastNumber = firstNumberVal - 1;

//   output.textContent = "";

//   for (const file of files) {
//     try {
//       let fromNumber = firstNumberVal + coordsNXYH.length;

//       const { multiPolygon, arrayNXYH } = await fileProcessing({
//         file,
//         coordSys,
//         output,
//         isXY,
//         fromNumber,
//       });

//       const wgsArray = sk63ToWgs84(multiPolygon);

//       coordsNXYH.push(...arrayNXYH);

//       allWgsArrays.push({
//         name: getFilenameFromFile(file),
//         wgsArray,
//       });
//     } catch (err) {
//       console.error("Помилка файлу:", file.name, err);
//     }
//   }

//   output.textContent = coordsNXYH.join("\n");

//   drawAllPolygons();
// }

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

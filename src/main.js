import "./style.css";
import { saveAs } from "file-saver";
import { processAllFiles } from "./fileProcessing.js";
import {
  drawAllPolygons,
  fitBoundsMulti,
  initMap,
  startWatchingLocation,
  stopWatchingLocation,
} from "./maps/google_maps/google_maps.js";
import { flattenCoords } from "./utilities/utilities.js";
import { downloadKML, multipleToKML } from "./utilities/saveKML.js";

// ==============================
// DOM
// ==============================
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const coordSys = document.querySelector(".coord-sys");
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
const mapEmpty = document.getElementById("mapEmpty");
const mapG = document.getElementById("mapG");

// ==============================
// Стан застосунку в одному об'єкті
// ==============================
const state = {
  files: [],
  allWgsArrays: [],
  coordsNXYH: [],
  isXY: true,
  firstArrayWGS: null,
  mapInitialized: false,
};

// ==============================
// Events
// ==============================
fileInput.addEventListener("change", onReadFile);
copyBtn.addEventListener("click", onCopyBtn);
firstNum.addEventListener("change", onChangeNumber);
changeXYBtn.addEventListener("click", onChangeXYBtn);
saveBtn.addEventListener("click", onSaveBtn);
saveKMLBtn.addEventListener("click", onSaveKMLBtn);
showMyLocationBtn.addEventListener("click", onShowMyLocationBtn);
centerOnMeBtn.addEventListener("click", onCenterOnMeBtn);
centerOnAreaBtn.addEventListener("click", onCenterOnAreaBtn);

// ==============================
// Handlers
// ==============================
async function onReadFile(e) {
  if (!e.target.files.length) return;

  state.files = Array.from(e.target.files);

  displayAtributes.forEach((el) => (el.style.display = ""));

  // Показуємо карту на десктопі, ховаємо заглушку
  if (mapEmpty) mapEmpty.style.display = "none";
  if (mapG) mapG.style.display = "block";

  await runProcessing();

  if (state.files) {
    dropZone.classList.add("downloaded");
  } else {
    dropZone.classList.remove("downloaded");
  }
}

async function onCopyBtn() {
  const text = coordOfArea.textContent;
  const [lat, lng] = text.split(", ");

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
  await runProcessing();
}

function onChangeXYBtn() {
  if (!state.files.length) return;
  if (!confirm("Змінити X та Y місцями?")) return;

  state.isXY = !state.isXY;
  runProcessing();
}

function onSaveBtn() {
  if (!state.allWgsArrays.length) return;

  const filename =
    state.allWgsArrays.length === 1
      ? `${state.allWgsArrays[0].name.replace(/\.[^.]+$/, "")}.txt`
      : "combined.txt";

  saveAs(new Blob([output.textContent]), filename);
}

function onSaveKMLBtn() {
  if (!state.allWgsArrays.length) return;

  const kml = multipleToKML(state.allWgsArrays);
  const filename =
    state.allWgsArrays.length === 1
      ? state.allWgsArrays[0].name.replace(/\.[^.]+$/, "")
      : "combined";

  downloadKML(kml, filename);
}

function onShowMyLocationBtn() {
  if (!state.mapInitialized) {
    alert("Спершу ініціалізуй карту!");
    return;
  }
  startWatchingLocation();
  showMyLocationBtn.style.display = "none";
  centerOnAreaBtn.style.display = "block";
}

function onCenterOnMeBtn() {
  startWatchingLocation();
  centerOnMeBtn.style.display = "none";
  centerOnAreaBtn.style.display = "block";
}

function onCenterOnAreaBtn() {
  stopWatchingLocation();
  fitBoundsMulti(state.firstArrayWGS);
  centerOnAreaBtn.style.display = "none";
  centerOnMeBtn.style.display = "block";
}

// ==============================
// Центральна функція обробки
// ==============================
async function runProcessing() {
  const { allWgsArrays, coordsNXYH } = await processAllFiles({
    firstNum,
    output,
    files: state.files,
    coordSys,
    isXY: state.isXY,
  });

  state.allWgsArrays = allWgsArrays;
  state.coordsNXYH = coordsNXYH;

  if (!allWgsArrays.length) return;

  state.firstArrayWGS = allWgsArrays[0].wgsArray;

  const flattenWGSArray = flattenCoords(state.firstArrayWGS);

  const averageWGS = flattenWGSArray.reduce(
    ([latAcc, lonAcc], [lat, lon], i) => {
      if (i < flattenWGSArray.length - 1) return [latAcc + lat, lonAcc + lon];
      return [
        (latAcc + lat) / flattenWGSArray.length,
        (lonAcc + lon) / flattenWGSArray.length,
      ];
    },
  );

  coordOfArea.textContent = averageWGS
    .map((coord) => coord.toFixed(8))
    .join(", ");

  if (!state.mapInitialized) {
    await initMap();
    state.mapInitialized = true;
  }

  drawAllPolygons(allWgsArrays, Number(firstNum.value));
  fitBoundsMulti(state.firstArrayWGS);
}

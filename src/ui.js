// ==============================
// Розгортання output в модальне вікно
// ==============================
const expandOutputBtn = document.getElementById("expandOutputBtn");
const outputModal = document.getElementById("outputModal");
const outputModalClose = document.getElementById("outputModalClose");
const outputModalBackdrop = document.getElementById("outputModalBackdrop");
const outputModalContent = document.getElementById("outputModalContent");
const outputEl = document.getElementById("output");

function openOutputModal() {
  outputModalContent.textContent = outputEl.textContent;
  outputModal.classList.add("is-open");
}

function closeOutputModal() {
  outputModal.classList.remove("is-open");
  outputEl.textContent = outputModalContent.textContent;
}

expandOutputBtn.addEventListener("click", openOutputModal);
outputModalClose.addEventListener("click", closeOutputModal);
outputModalBackdrop.addEventListener("click", closeOutputModal);

// Закриття по Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeOutputModal();
});

// ==============================
// Мобільний toggle карти
// ==============================
const mapContainer = document.getElementById("mapContainer");
const btnShowMap = document.getElementById("btnShowMap");
const btnCloseMap = document.getElementById("btnCloseMap");
const geoSection = document.querySelector(".panel__section--geolocation");

btnShowMap.addEventListener("click", () => {
  mapContainer.classList.add("is-open");
  geoSection?.classList.add("on-map");
});

btnCloseMap.addEventListener("click", () => {
  mapContainer.classList.remove("is-open");
  geoSection?.classList.remove("on-map");
});

// ==============================
// Drag-and-drop на drop zone
// ==============================
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drop-zone--active");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drop-zone--active");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drop-zone--active");
  const dt = new DataTransfer();
  [...e.dataTransfer.files].forEach((f) => dt.items.add(f));
  fileInput.files = dt.files;
  fileInput.dispatchEvent(new Event("change"));
});

// ==============================
// Блокування жестів масштабування
// ==============================
document.addEventListener("gesturestart", (e) => e.preventDefault());
document.addEventListener("gesturechange", (e) => e.preventDefault());
document.addEventListener("gestureend", (e) => e.preventDefault());

document.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) e.preventDefault();
  },
  { passive: false },
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (e.scale !== undefined && e.scale !== 1) e.preventDefault();
  },
  { passive: false },
);

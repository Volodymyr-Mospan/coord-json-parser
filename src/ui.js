// ==============================
// Мобільний toggle карти
// ==============================
const mapContainer = document.getElementById("mapContainer");
const btnShowMap = document.getElementById("btnShowMap");
const btnCloseMap = document.getElementById("btnCloseMap");

btnShowMap.addEventListener("click", () => {
  mapContainer.classList.add("is-open");
});

btnCloseMap.addEventListener("click", () => {
  mapContainer.classList.remove("is-open");
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
  (e) => { if (e.ctrlKey) e.preventDefault(); },
  { passive: false },
);

document.addEventListener(
  "touchmove",
  (e) => { if (e.scale !== undefined && e.scale !== 1) e.preventDefault(); },
  { passive: false },
);

import { flattenCoords } from "../../utilities/utilities";

let map;
let polygons = [];
let markers = [];
let infoWindow;

// 🔹 Ініціалізація карти
export async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  await google.maps.importLibrary("geometry");
  await google.maps.importLibrary("marker");
  map = new Map(document.getElementById("mapG"), {
    mapId: "aeabb86f4d1ecf8ae9f0c27",
    gestureHandling: "greedy",
    mapTypeId: "satellite",
  });
  infoWindow = new google.maps.InfoWindow();
  return map;
}

let userMarker;
let watchId = null;

export async function startWatchingLocation() {
  if (!navigator.geolocation) {
    alert("Геолокація не підтримується вашим браузером.");
    return;
  }

  if (watchId) {
    alert("Вже відстежуємо вашу локацію!");
    return;
  }

  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // 🔹 Створюємо DOM-елемент маркера один раз
  const userMarkerElement = document.createElement("div");
  userMarkerElement.style.width = "16px";
  userMarkerElement.style.height = "16px";
  userMarkerElement.style.backgroundColor = "#00f";
  userMarkerElement.style.border = "2px solid #fff";
  userMarkerElement.style.borderRadius = "50%";

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const userPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      if (userMarker) {
        userMarker.position = userPos; // оновлюємо позицію
      } else {
        userMarker = new AdvancedMarkerElement({
          map,
          position: userPos,
          content: userMarkerElement, // передаємо DOM Node
          title: "Ви тут!",
        });
      }

      map.setCenter(userPos);
      // map.setZoom(18);
    },
    (error) => {
      alert("Не вдалося отримати вашу геолокацію: " + error.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 3000,
    },
  );
}

export function stopWatchingLocation() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    // console.log("🛑 Відстеження геолокації зупинено");
  }
}

// ===============================
// 🔹 Малювання один MultiPolygon
// ===============================
export async function drawMultiPolygon(
  multiPolygonCoords,
  flattenWGSArray,
  starterNum,
) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  multiPolygonCoords.forEach((polygonCoords) => {
    const polygon = new google.maps.Polygon({
      paths: polygonCoords,
      strokeColor: "#ff00e6",
      strokeWeight: 2,
      fillColor: "#0044ff5b",
      fillOpacity: 0.3,
      editable: false,
    });

    polygon.setMap(map);
    polygons.push(polygon);

    // 🔹 Клік → координати
    // polygon.addListener("click", (event) => {
    //   infoWindow.setContent(
    //     `${event.latLng.lat().toFixed(8)}, ${event.latLng.lng().toFixed(8)}`,
    //   );
    //   infoWindow.setPosition(event.latLng);
    //   infoWindow.open(map);
    // });

    // 🔹 Нумерація точок
    flattenWGSArray.forEach(([lat, lng], index) => {
      const marker = new AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content: createMarkerLabel(index + starterNum),
      });

      markers.push(marker);
    });

    // // 🔹 Площа
    // const area = google.maps.geometry.spherical.computeArea(polygon.getPath());

    // console.log(`Площа полігону ${polygonIndex + 1}: ${area.toFixed(2)} м²`);
  });
}

// ===============================
// 🔹 Малювання всіх MultiPolygon
// ===============================
export function drawAllPolygons(allWgsArrays, firstNumValue = 1) {
  if (!allWgsArrays.length) return;
  clearMap();
  let lastNumber = firstNumValue - 1;

  allWgsArrays.forEach(({ wgsArray }) => {
    const flattenArray = flattenCoords(wgsArray);
    drawMultiPolygon(wgsArray, flattenArray, lastNumber + 1);
    lastNumber += flattenArray.length;
  });
}

// ===============================
// 🔹 HTML-маркер з номером
// ===============================
function createMarkerLabel(number) {
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "flex";

  const div = document.createElement("div");
  div.style.transform = "translate(0, -20%)";
  div.style.background = "#ffffffea";
  div.style.border = "2px solid red";
  div.style.borderRadius = "50%";
  div.style.minWidth = "22px";
  div.style.height = "22px";
  div.style.padding = "3px";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.color = "#000000";
  div.style.fontSize = "14px";
  div.style.fontWeight = "bold";
  div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  div.textContent = number;

  // 🔴 центральна точка 3x3
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.width = "5px";
  dot.style.height = "5px";
  dot.style.background = "red";
  dot.style.borderRadius = "50%";
  dot.style.left = "50%";
  dot.style.top = "100%";
  dot.style.transform = "translate(-50%, -50%)";

  wrapper.appendChild(div);
  wrapper.appendChild(dot);

  return wrapper;
}

// ===============================
// 🔹 Автоцентрування
// ===============================
export function fitBoundsMulti(coords) {
  const bounds = new google.maps.LatLngBounds();

  function traverse(arr) {
    if (!Array.isArray(arr)) return;

    if (arr.length && arr[0]?.lat !== undefined) {
      arr.forEach((p) => {
        if (typeof p.lat === "number" && typeof p.lng === "number") {
          bounds.extend(p);
        } else {
          console.warn("Bad point:", p);
        }
      });
      return;
    }

    arr.forEach(traverse);
  }

  traverse(coords);

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, 50);
  }
}

// ===============================
// 🔹 Очистка карти
// ===============================
export function clearMap() {
  markers.forEach((m) => m.setMap(null));
  polygons.forEach((p) => p.setMap(null));
  markers = [];
  polygons = [];
}

// ===============================
// 📏 ЛІНІЙКА
// ===============================
let rulerActive = false;
let rulerPoints = []; // {lat, lng}[]
let rulerPolyline = null;
let rulerClosingLine = null; // замикаюча лінія (остання→перша)
let rulerPolygon = null;
let rulerDots = []; // маркери-точки
let rulerLabels = []; // підписи відрізків
let rulerAreaLabel = null; // підпис площі
let rulerClickListener = null;

// Форматування відстані
function formatDistance(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(3)} км`;
  return `${meters.toFixed(1)} м`;
}

// Форматування площі
function formatArea(sqMeters) {
  if (sqMeters >= 10000) return `${(sqMeters / 10000).toFixed(4)} га`;
  return `${sqMeters.toFixed(1)} м²`;
}

// Середина відрізку
function midpoint(a, b) {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
  };
}

// DOM-підпис для AdvancedMarkerElement
function createLabelElement(text, isArea = false) {
  const div = document.createElement("div");
  div.style.cssText = [
    "background:rgba(15,17,23,0.85)",
    "color:" + (isArea ? "#00d4aa" : "#eef2f8"),
    "font-family:'JetBrains Mono',monospace",
    "font-size:" + (isArea ? "13px" : "12px"),
    "font-weight:" + (isArea ? "700" : "500"),
    "padding:3px 7px",
    "border-radius:4px",
    "border:1px solid " + (isArea ? "#00d4aa" : "#2a3040"),
    "white-space:nowrap",
    "pointer-events:none",
    "box-shadow:0 2px 8px rgba(0,0,0,0.5)",
  ].join(";");
  div.textContent = text;
  return div;
}

// Маркер-точка (невеликий кружок)
function createDotElement(isFirst = false) {
  const div = document.createElement("div");
  div.style.cssText = [
    "width:" + (isFirst ? "10px" : "8px"),
    "height:" + (isFirst ? "10px" : "8px"),
    "background:" + (isFirst ? "#00d4aa" : "#eef2f8"),
    "border:2px solid " + (isFirst ? "#00d4aa" : "#0f1117"),
    "border-radius:50%",
    "cursor:crosshair",
  ].join(";");
  return div;
}

// Оновити тільки лінії та підписи (без перестворення маркерів) — для drag
function rulerUpdateLines() {
  const spherical = google.maps.geometry.spherical;

  // оновлюємо полілінію
  if (rulerPolyline) rulerPolyline.setPath(rulerPoints);

  // підписи та замикання перемальовуємо повністю (вони легкі)
  rulerLabels.forEach((l) => l.setMap(null));
  rulerLabels = [];
  if (rulerClosingLine) {
    rulerClosingLine.setMap(null);
    rulerClosingLine = null;
  }
  if (rulerPolygon) {
    rulerPolygon.setMap(null);
    rulerPolygon = null;
  }
  if (rulerAreaLabel) {
    rulerAreaLabel.setMap(null);
    rulerAreaLabel = null;
  }

  const n = rulerPoints.length;

  // підписи відрізків
  rulerLabels = rulerPoints.slice(0, -1).map((a, i) => {
    const b = rulerPoints[i + 1];
    const dist = spherical.computeDistanceBetween(
      new google.maps.LatLng(a),
      new google.maps.LatLng(b),
    );
    return new google.maps.marker.AdvancedMarkerElement({
      map,
      position: midpoint(a, b),
      content: createLabelElement(formatDistance(dist)),
    });
  });

  if (n >= 3) {
    const first = rulerPoints[0];
    const last = rulerPoints[n - 1];

    rulerClosingLine = new google.maps.Polyline({
      path: [last, first],
      strokeColor: "#00d4aa",
      strokeWeight: 2,
      strokeOpacity: 0.5,
      map,
    });

    const closeDist = spherical.computeDistanceBetween(
      new google.maps.LatLng(last),
      new google.maps.LatLng(first),
    );
    rulerLabels.push(
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: midpoint(last, first),
        content: createLabelElement(formatDistance(closeDist)),
      }),
    );

    rulerPolygon = new google.maps.Polygon({
      paths: rulerPoints,
      strokeOpacity: 0,
      fillColor: "#00d4aa",
      fillOpacity: 0.08,
      map,
    });

    const area = spherical.computeArea(
      rulerPoints.map((p) => new google.maps.LatLng(p)),
    );
    const center = rulerPoints.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat / n, lng: acc.lng + p.lng / n }),
      { lat: 0, lng: 0 },
    );
    rulerAreaLabel = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: center,
      content: createLabelElement(formatArea(area), true),
    });
  }
}

// Перемалювати все
async function rulerRedraw() {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const spherical = google.maps.geometry.spherical;

  // --- очистка
  if (rulerPolyline) {
    rulerPolyline.setMap(null);
    rulerPolyline = null;
  }
  if (rulerClosingLine) {
    rulerClosingLine.setMap(null);
    rulerClosingLine = null;
  }
  if (rulerPolygon) {
    rulerPolygon.setMap(null);
    rulerPolygon = null;
  }
  rulerDots.forEach((d) => d.setMap(null));
  rulerDots = [];
  rulerLabels.forEach((l) => l.setMap(null));
  rulerLabels = [];
  if (rulerAreaLabel) {
    rulerAreaLabel.setMap(null);
    rulerAreaLabel = null;
  }

  if (rulerPoints.length === 0) return;

  const n = rulerPoints.length;

  // --- полілінія
  rulerPolyline = new google.maps.Polyline({
    path: rulerPoints,
    strokeColor: "#00d4aa",
    strokeWeight: 2,
    strokeOpacity: 0.9,
    map,
  });

  // --- точки (draggable через старий Marker, бо AdvancedMarker не підтримує drag надійно)
  for (let i = 0; i < n; i++) {
    const dot = new google.maps.Marker({
      map,
      position: rulerPoints[i],
      draggable: true,
      cursor: "grab",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: i === 0 ? 6 : 5,
        fillColor: i === 0 ? "#00d4aa" : "#eef2f8",
        fillOpacity: 1,
        strokeColor: i === 0 ? "#00d4aa" : "#0f1117",
        strokeWeight: 2,
      },
    });

    // Під час перетягування — оновлюємо тільки лінії (швидко, без flickering)
    dot.addListener("drag", (e) => {
      rulerPoints[i] = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      rulerUpdateLines();
    });

    // Під час drag — забороняємо карті переміщатись
    dot.addListener("dragstart", () => {
      map.setOptions({ gestureHandling: "none" });
    });
    dot.addListener("dragend", (e) => {
      rulerPoints[i] = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      map.setOptions({ gestureHandling: "greedy" });
      rulerUpdateLines();
    });

    rulerDots.push(dot);
  }

  // лінії та підписи
  rulerUpdateLines();
}

// Увімкнути лінійку
export async function rulerStart() {
  if (rulerActive) return;
  rulerActive = true;
  rulerPoints = [];
  map.setOptions({ cursor: "crosshair" });

  rulerClickListener = map.addListener("click", async (e) => {
    rulerPoints.push({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    await rulerRedraw();
  });
}

// Вимкнути і очистити лінійку
export function rulerStop() {
  if (!rulerActive) return;
  rulerActive = false;
  rulerPoints = [];
  map.setOptions({ cursor: "", gestureHandling: "greedy" });

  if (rulerClickListener) {
    google.maps.event.removeListener(rulerClickListener);
    rulerClickListener = null;
  }

  if (rulerPolyline) {
    rulerPolyline.setMap(null);
    rulerPolyline = null;
  }
  if (rulerClosingLine) {
    rulerClosingLine.setMap(null);
    rulerClosingLine = null;
  }
  if (rulerPolygon) {
    rulerPolygon.setMap(null);
    rulerPolygon = null;
  }
  rulerDots.forEach((d) => {
    google.maps.event.clearInstanceListeners(d);
    d.setMap(null);
  });
  rulerDots = [];
  rulerLabels.forEach((l) => l.setMap(null));
  rulerLabels = [];
  if (rulerAreaLabel) {
    rulerAreaLabel.setMap(null);
    rulerAreaLabel = null;
  }
}

export function rulerIsActive() {
  return rulerActive;
}

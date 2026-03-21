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
// 🔹 Малювання MultiPolygon
// ===============================
export async function drawMultiPolygon(
  multiPolygonCoords,
  flattenWGSArray,
  starterNum,
) {
  clearMap();

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
    polygon.addListener("click", (event) => {
      infoWindow.setContent(
        `${event.latLng.lat().toFixed(8)}, ${event.latLng.lng().toFixed(8)}`,
      );
      infoWindow.setPosition(event.latLng);
      infoWindow.open(map);
    });

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
export function drawAllPolygons(allWgsArrays, lastNumber) {
  if (!allWgsArrays.length) return;
  lastNumber = Number(firstNum.value) - 1;

  if (mapG) {
    clearMap();
  }

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
  div.style.width = "22px";
  div.style.height = "22px";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
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

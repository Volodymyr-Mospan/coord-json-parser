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

export function showMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      // watchPosition
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Якщо маркер вже існує, оновлюємо позицію
        if (userMarker) {
          userMarker.setPosition(userPos);
        } else {
          // Створюємо маркер користувача
          userMarker = new google.maps.Marker({
            position: userPos,
            map: map,
            title: "Ви тут!",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#00f",
              fillOpacity: 0.8,
              strokeWeight: 2,
              strokeColor: "#fff",
            },
          });
        }

        // Центруємо карту на користувачі
        map.setCenter(userPos);
        map.setZoom(17);
      },
      (error) => {
        alert("Не вдалося отримати вашу геолокацію: " + error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      },
    );
  } else {
    alert("Геолокація не підтримується вашим браузером.");
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

  multiPolygonCoords.forEach((polygonCoords, polygonIndex) => {
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

    // 🔹 Площа
    const area = google.maps.geometry.spherical.computeArea(polygon.getPath());

    console.log(`Площа полігону ${polygonIndex + 1}: ${area.toFixed(2)} м²`);
  });

  fitBoundsMulti(multiPolygonCoords);
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
function fitBoundsMulti(coords) {
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
function clearMap() {
  polygons.forEach((p) => p.setMap(null));
  markers.forEach((m) => (m.map = null));

  polygons = [];
  markers = [];
}

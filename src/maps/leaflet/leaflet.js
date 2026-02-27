import L from "leaflet";

let map = null;
let polygon = null;

export function createMap(point, coordArray) {
  if (!map) {
    map = L.map("map").setView(point, 18);
  } else {
    map.removeLayer(polygon);
  }

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  const esri = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  );

  L.control.layers({ Карта: osm, Супутник: esri }).addTo(map);

  map.setView(point, 18);
  polygon = L.polygon(coordArray).addTo(map);
  polygon.bindPopup(point.map((coord) => coord.toFixed(8)).join(", "));
}

//   L.tileLayer(
//     "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
//     {
//       maxZoom: 20,
//       attribution:
//         '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
//     },
//   ).addTo(map);

//   L.tileLayer(
//     "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
//     {
//       attribution: "&copy; Esri, Maxar, Earthstar Geographics",
//       maxZoom: 19,
//     },
//   ).addTo(map);

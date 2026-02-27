import L from "leaflet";

let map = null;
let polygon = null;

export function createMap(point, coordArray) {
  if (!map) {
    map = L.map("map").setView(point, 18);
  } else {
    map.removeLayer(polygon);
  }

  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
  const esri = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 20,
      attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    },
  );

  osm.addTo(map);

  L.control.layers({ Карта: osm, Супутник: esri }).addTo(map);

  map.setView(point, 18);
  polygon = L.polygon(coordArray).addTo(map);
  polygon.bindPopup(point.map((coord) => coord.toFixed(8)).join(", "));
}

import L from "leaflet";

let map = null;
let polygon = null;

export function initMap(point, coordArray) {
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
  // const earth = L.tileLayer(
  //   "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
  //   {
  //     maxZoom: 22,
  //     attribution: "&copy; Google",
  //   },
  // );

  osm.addTo(map);

  // L.control.layers({ Карта: osm, Супутник: esri, Земля: earth }).addTo(map);
  L.control.layers({ Карта: osm, Супутник: esri }).addTo(map);

  map.setView(point, 18);
  polygon = L.polygon(coordArray).addTo(map);
  polygon.bindPopup(point.map((coord) => coord.toFixed(8)).join(", "));
  map.fitBounds(polygon.getBounds());
}

import L from "leaflet";

let map = null;
let polygon = null;

export function createMap(point, coordArray) {
  if (!map) {
    map = L.map("map").setView(point, 19);
  } else {
    map.removeLayer(polygon);
  }

  L.tileLayer(
    "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  ).addTo(map);

  //   L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //     maxZoom: 19,
  //     attribution:
  //       '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  //   }).addTo(map);

  map.panTo(point);
  polygon = L.polygon(coordArray).addTo(map);
  polygon.bindPopup(point.map((coord) => coord.toFixed(8)).join(", "));
}

// export function mapRemove() {
//   map.removeLayer(polygon);
// }

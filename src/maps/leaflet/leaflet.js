import L from "leaflet";

// import { sk63ToWgs84 } from "../../sc63toWGS/sc63zone4toWGS.js";
// // const point = wgs84ToSk63(50.368738, 31.327039);
// // const point = sk63ToWgs84(5573426.02, 4216638.92);

// const point = sk63ToWgs84(5573426.0199999996, 4216638.9199999999);
// console.log(point);

export function createMap(point, coordArray) {
  const map = L.map("map").setView(point, 19);

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

  var circle = L.circle(point, {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);

  var polygon = L.polygon(coordArray).addTo(map);
}

export function cratePolygon(coordArray) {
  var polygon = L.polygon([
    [50.3688, 31.32666],
    [50.3687, 31.32709],
    [50.3687, 31.32718],
  ]).addTo(map);
}

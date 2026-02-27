import L from "leaflet";

import { sk63ToWgs84 } from "../../sc63toWGS/sc63zone4toWGS.js";
// const point = wgs84ToSk63(50.368738, 31.327039);
// const point = sk63ToWgs84(5573426.02, 4216638.92);

const point = sk63ToWgs84(5573426.0199999996, 4216638.9199999999);
console.log(point);

const map = L.map("map").setView(point, 19);

L.tileLayer("http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
// L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   maxZoom: 19,
//   attribution:
//     '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
// }).addTo(map);

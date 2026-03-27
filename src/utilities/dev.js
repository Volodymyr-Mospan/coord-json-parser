import { saveAs } from "file-saver";
const devBtn = document.getElementById("dev");

const newJson = {
  type: "MultiPolygon",
  coordinates: [[[]]], // coordinates: [[[["Y", "X"]]]],
  properties: { coordSys: "SC63" },
};
for (let x = 4975000; x < 5775000; x += 10000) {
  for (let y = 3180000; y < 3430000; y += 10000) {
    newJson.coordinates[0][0].push([y, x]);
  }
}
// const newJson = {
//   type: "Feature",
//   properties: {},
//   style: {
//     color: "#000000",
//     width: 0,
//     opacity: 1,
//     fillColor: "#000000",
//     fillOpacity: 0,
//   },
//   geometry: {
//     type: "Polygon",
//     coordinates: [[["Y", "X"]]],
//     properties: { coordSys: "SC63" },
//   },
// };

// for (let x = 5275000; x < 5775000; x += 10000) {
//   for (let y = 2185000; y < 2425000; y += 10000) {
//     newJson.geometry.coordinates[0].push([y, x]);
//   }
// }

devBtn.addEventListener("click", onDevBtn);

function onDevBtn() {
  saveAs(
    new Blob([JSON.stringify(newJson, null, 2)], {
      type: "application/json",
    }),
  );
}

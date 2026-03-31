import { saveAs } from "file-saver";
const devBtn = document.getElementById("dev");

const newJson = {
  type: "MultiPolygon",
  coordinates: [[[]]], // coordinates: [[[["Y", "X"]]]],
  properties: { coordSys: "SC63" },
};
for (let x = 5140000; x <= 5600000; x += 10000) {
  for (let y = 6184000; y <= 6414000; y += 10000) {
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

devBtn.addEventListener("click", onDevBtn);

function onDevBtn() {
  saveAs(
    new Blob([JSON.stringify(newJson, null, 2)], {
      type: "application/json",
    }),
  );
}

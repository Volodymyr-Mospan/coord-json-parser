import { saveAs } from "file-saver";
const devBtn = document.getElementById("dev");

const newJson = {
  type: "Feature",
  properties: {},
  style: {
    color: "#000000",
    width: 0,
    opacity: 1,
    fillColor: "#000000",
    fillOpacity: 0,
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        ["Y", "X"],
        ["Y", "X"],
        ["Y", "X"],
        ["Y", "X"],
        ["Y", "X"],
      ],
    ],
    properties: { coordSys: "Local,MCK-32" },
  },
};

for (let x = 5560000.0; x < 5610000.0; x += 5000) {
  for (let y = 280000.0; y < 325000.0; y += 5000) {
    newJson.geometry.coordinates[0].push([y, x]);
  }
}

devBtn.addEventListener("click", onDevBtn);

function onDevBtn() {
  saveAs(
    new Blob([JSON.stringify(newJson, null, 2)], {
      type: "application/json",
    }),
  );
}

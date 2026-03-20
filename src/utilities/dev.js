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
        [338210.482, 5586173.855],
        [338595.578, 5586067.243],
        [338550.2, 5586003.245],
        [338181.601, 5586105.285],
        [338210.482, 5586173.855],
      ],
    ],
    properties: { coordSys: "Local,MCK-32" },
  },
};

for (let x = 5450000.0; x < 5720000.0; x += 5000) {
  for (let y = 214000.0; y < 424000.0; y += 5000) {
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

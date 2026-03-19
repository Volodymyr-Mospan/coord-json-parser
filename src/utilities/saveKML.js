export function gmPathsToKML(paths, name = "Polygon") {
  const toKmlCoords = (ring) => {
    const coords = ring.map((p) => `${p.lng},${p.lat},0`);

    // замкнути кільце
    if (coords[0] !== coords[coords.length - 1]) {
      coords.push(coords[0]);
    }

    return coords.join("\n");
  };

  const polygonsKml = paths
    .map((polygon) => {
      const outer = polygon[0];
      const holes = polygon.slice(1);

      const outerKml = `
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>
            ${toKmlCoords(outer)}
          </coordinates>
        </LinearRing>
      </outerBoundaryIs>
    `;

      const holesKml = holes
        .map(
          (hole) => `
      <innerBoundaryIs>
        <LinearRing>
          <coordinates>
            ${toKmlCoords(hole)}
          </coordinates>
        </LinearRing>
      </innerBoundaryIs>
    `,
        )
        .join("");

      return `
      <Polygon>
        ${outerKml}
        ${holesKml}
      </Polygon>
    `;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>

    <Style id="polyStyle">
      <LineStyle>
        <color>ff0000ff</color>
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>2200ff00</color>
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
    </Style>

    <Placemark>
      <name>${name}</name>
      <description>${name}</description>
      <styleUrl>#polyStyle</styleUrl>

      <MultiGeometry>
        ${polygonsKml}
      </MultiGeometry>

    </Placemark>

  </Document>
</kml>`;
}

export function multipleToKML(allData) {
  const placemarks = allData
    .map(({ name, wgsArray }) => {
      const multi = gmPathsToKML(wgsArray, name);

      // вирізаємо тільки <MultiGeometry>...</MultiGeometry>
      const match = multi.match(/<MultiGeometry>[\s\S]*<\/MultiGeometry>/);

      return `
      <Placemark>
        <name>${name}</name>
        <description>${name}</description>
        <styleUrl>#myPolyStyle</styleUrl>
        ${match ? match[0] : ""}
      </Placemark>
    `;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
      <Style id="myPolyStyle">
        <LineStyle>
          <color>ff00ff00</color>
          <width>2</width>
        </LineStyle>
        <PolyStyle>
          <color>2200ff00</color>
          <fill>1</fill>
          <outline>1</outline>
        </PolyStyle>
      </Style>
      ${placemarks}
    </Document>
  </kml>`;
}

export function downloadKML(kml, filename = "polygon.kml") {
  filename += ".kml";
  const blob = new Blob([kml], {
    type: "application/vnd.google-earth.kml+xml",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

import proj4 from "proj4";
import * as math from "mathjs";
import { POINTSz3 } from "./sc63_zone3";
import { POINTSz4 } from "./sc63_zone4";
import { POINTSz2 } from "./sc63_zone2";

proj4.defs("WGS84", "+proj=longlat +datum=WGS84 +no_defs");

// --- еліпсоїди
const WGS84 = { a: 6378137.0, f: 1 / 298.257223563 };
const KRASS = { a: 6378245.0, f: 1 / 298.3 };

// --- допоміжна функція/геодезичні → ECEF
function geodeticToECEF(lat, lon, h, ell) {
  const a = ell.a;
  const f = ell.f;
  const e2 = 2 * f - f * f;

  const φ = (lat * Math.PI) / 180;
  const λ = (lon * Math.PI) / 180;

  const sinφ = Math.sin(φ);
  const cosφ = Math.cos(φ);

  const N = a / Math.sqrt(1 - e2 * sinφ * sinφ);

  const X = (N + h) * cosφ * Math.cos(λ);
  const Y = (N + h) * cosφ * Math.sin(λ);
  const Z = (N * (1 - e2) + h) * sinφ;

  return [X, Y, Z];
}

// --- підготовка 7 параметрів Хелмерта
function preparationHelmertParams(points, proj4ZoneParam) {
  const A = [];
  const L = [];

  points.forEach(([lat, lon, X, Y]) => {
    // WGS → ECEF
    const [X1, Y1, Z1] = geodeticToECEF(lat, lon, 0, WGS84);

    // СК63 → геодезичні → ECEF
    const [lon2, lat2] = proj4(proj4ZoneParam, "WGS84", [Y, X]);
    const [X2, Y2, Z2] = geodeticToECEF(lat2, lon2, 0, KRASS);

    // рівняння
    A.push([1, 0, 0, 0, Z2, -Y2, X2]);
    A.push([0, 1, 0, -Z2, 0, X2, Y2]);
    A.push([0, 0, 1, Y2, -X2, 0, Z2]);

    L.push(X1 - X2);
    L.push(Y1 - Y2);
    L.push(Z1 - Z2);
  });

  // --- рішення МНК: (AᵀA)^-1 AᵀL
  const AT = math.transpose(A);
  const N = math.multiply(AT, A);
  const U = math.multiply(AT, L);

  const params = math.multiply(math.inv(N), U);

  return params;
}

// --- основна функція/застосування
export function sk63ToWgs84(coordArray) {
  let numberOfZone = (function lookingZoneNumber(c) {
    if (!Array.isArray(c)) return;
    if (c.length && typeof c[0] === "number") {
      return c.toString()[0];
    } else {
      if (Array.isArray(c[0])) return lookingZoneNumber(c[0]);
    }
  })(coordArray);

  let proj4ZoneParam;
  let helmertParams;

  switch (numberOfZone) {
    case "2":
      proj4ZoneParam = "SK63_ZONE2";
      helmertParams = preparationHelmertParams(POINTSz2, proj4ZoneParam);
      break;

    case "3":
      proj4ZoneParam = "SK63_ZONE3";
      helmertParams = preparationHelmertParams(POINTSz3, proj4ZoneParam);
      break;

    case "4":
      proj4ZoneParam = "SK63_ZONE4";
      helmertParams = preparationHelmertParams(POINTSz4, proj4ZoneParam);
      break;

    default:
      break;
  }

  const [dx, dy, dz, rx, ry, rz, m] = helmertParams;

  const wgsMultiPolygon = (function createWGSMultiPolygon(c) {
    if (c.length && typeof c[0] === "number") {
      return transform(c);
    }
    if (Array.isArray(c[0])) {
      return c.map((el) => createWGSMultiPolygon(el));
    }
  })(coordArray);

  console.log("🚀 ~ createWGSMultiPolygon ~ wgsMultiPolygon:", wgsMultiPolygon);

  function transform([y, x]) {
    const [lon, lat] = proj4(proj4ZoneParam, "WGS84", [y, x]);
    const [X, Y, Z] = geodeticToECEF(lat, lon, 0, KRASS);

    const X2 = dx + (1 + m) * X - rz * Y + ry * Z;
    const Y2 = dy + rz * X + (1 + m) * Y - rx * Z;
    const Z2 = dz - ry * X + rx * Y + (1 + m) * Z;

    // назад у геодезичні (ітерація)
    const lon2 = Math.atan2(Y2, X2);
    const p = Math.sqrt(X2 * X2 + Y2 * Y2);

    let lat2 = Math.atan2(Z2, p * (1 - 0.00669438));

    for (let i = 0; i < 5; i++) {
      const N = 6378137 / Math.sqrt(1 - 0.00669438 * Math.sin(lat2) ** 2);
      lat2 = Math.atan2(Z2, p * (1 - (0.00669438 * N) / N));
    }

    return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
  }

  return wgsMultiPolygon;
}

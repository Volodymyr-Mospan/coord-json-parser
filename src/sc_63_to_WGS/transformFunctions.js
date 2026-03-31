import proj4 from "proj4";
import * as math from "mathjs";
import { POINTSz1 } from "./sc63_zone1";
import { POINTSz2 } from "./sc63_zone2";
import { POINTSz3 } from "./sc63_zone3";
import { POINTSz4 } from "./sc63_zone4";
import { POINTSz5 } from "./sc63_zone5";
import { POINTSsk42loc85 } from "./sc42_loc85";
import { deepEqual } from "../utilities/utilities";
import { POINTSz6 } from "./sc63_zone6";

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
// coordSys — рядок з jsonData.properties.coordSys (наприклад "SC42")
// якщо не передано — визначає зону СК-63 за першою цифрою координати
export function sk63ToWgs84(coordArray, coordSys) {
  let proj4ZoneParam;
  let helmertParams;

  if (coordSys === "SC42") {
    // СК-42 локальна Київ 1985
    proj4ZoneParam = "SK42_LOC85";
    helmertParams = preparationHelmertParams(POINTSsk42loc85, proj4ZoneParam);
  } else {
    // СК-63: визначаємо зону за першою цифрою координати
    const numberOfZone = (function lookingZoneNumber(c) {
      if (!Array.isArray(c)) return;
      if (c.length && typeof c[0] === "number") {
        return c.toString()[0];
      } else {
        if (Array.isArray(c[0])) return lookingZoneNumber(c[0]);
      }
    })(coordArray);

    switch (numberOfZone) {
      case "1":
        proj4ZoneParam = "SK63_ZONE1";
        helmertParams = preparationHelmertParams(POINTSz1, proj4ZoneParam);
        break;
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
      case "5":
        proj4ZoneParam = "SK63_ZONE5";
        helmertParams = preparationHelmertParams(POINTSz5, proj4ZoneParam);
        break;
      case "6":
        proj4ZoneParam = "SK63_ZONE6";
        helmertParams = preparationHelmertParams(POINTSz6, proj4ZoneParam);
        break;
      default:
        console.error("Невідома зона СК-63:", numberOfZone);
        return coordArray;
    }
  }

  const [dx, dy, dz, rx, ry, rz, m] = helmertParams;

  const wgsMultiPolygon = (function createWGSMultiPolygon(c) {
    if (!Array.isArray(c)) return null;

    // точка
    if (c.length === 2 && typeof c[0] === "number") {
      return transform(c);
    }

    // якщо це масив точок
    if (Array.isArray(c[0]) && typeof c[0][0] === "number") {
      const ring = deepEqual(c[0], c[c.length - 1]) ? c.slice(0, -1) : c;
      return ring.map(transform);
    }

    // якщо це multipolygon
    return c.map(createWGSMultiPolygon);
  })(coordArray);

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

    const finalLat = (lat2 * 180) / Math.PI;
    const finalLng = (lon2 * 180) / Math.PI;

    return { lat: finalLat, lng: finalLng };
  }

  console.log("🚀 ~ sk63ToWgs84 ~ wgsMultiPolygon:", wgsMultiPolygon);
  return wgsMultiPolygon;
}

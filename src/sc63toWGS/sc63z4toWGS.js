import proj4 from "proj4";
import * as math from "mathjs";

// --- еліпсоїди
const WGS84 = { a: 6378137.0, f: 1 / 298.257223563 };
const KRASS = { a: 6378245.0, f: 1 / 298.3 };

// --- допоміжні функції
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

// --- твої точки
const points = [
  // [lat, lon, X, Y]
  [51.494994, 31.159013, 5698903.784, 4206988.506],
  [51.525657, 32.500554, 5701461.986, 4300154.764],
  [51.678669, 33.900568, 5719414.881, 4396990.645],
  [49.422179, 31.240523, 5468237.381, 4208738.835],
  [49.398545, 32.592473, 5464849.651, 4306827.214],
  [49.343724, 33.950651, 5459760.597, 4405528.181],
  [46.614316, 31.092164, 5156228.487, 4192272.332],
  [46.074748, 32.501527, 5095287.814, 4300231.941],
  [44.396419, 33.925787, 4909752.662, 4413706.609],
];

// --- визначення проєкції СК63
proj4.defs(
  "SK63",
  "+proj=tmerc +lat_0=0 +lon_0=32.5 +k=1 +x_0=4300000 +y_0=0 +ellps=krass +units=m +no_defs",
);

// --- підготовка ECEF масивів
const A = [];
const L = [];

points.forEach(([lat, lon, X, Y]) => {
  // WGS → ECEF
  const [X1, Y1, Z1] = geodeticToECEF(lat, lon, 0, WGS84);

  // СК63 → геодезичні → ECEF
  const [lon2, lat2] = proj4("SK63", "WGS84", [Y, X]);
  const [X2, Y2, Z2] = geodeticToECEF(lat2, lon2, 0, KRASS);

  // рівняння
  A.push([1, 0, 0, 0, Z2, -Y2, X2]);
  A.push([0, 1, 0, -Z2, 0, X2, Y2]);
  A.push([0, 0, 1, Y2, -X2, 0, Z2]);

  L.push(X1 - X2);
  L.push(Y1 - Y2);
  L.push(Z1 - Z2);
});

// --- МНК: (AᵀA)^-1 AᵀL
function transpose(m) {
  return m[0].map((_, i) => m.map((row) => row[i]));
}

function multiply(a, b) {
  return a.map((row) =>
    b[0].map((_, j) => row.reduce((sum, val, k) => sum + val * b[k][j], 0)),
  );
}

// простий інверс (через numeric stability — ок для 7x7)
function inverse(m) {
  return math.inv(m); // <-- потрібна math.js
}

// --- ПІДКЛЮЧИ math.js у проєкті!
// npm install mathjs

const AT = transpose(A);
const N = multiply(AT, A);
const U = multiply(
  AT,
  L.map((v) => [v]),
);

const params = multiply(inverse(N), U);

// --- параметри
const [dx, dy, dz, rx, ry, rz, m] = params.map((v) => v[0]);

// console.log("Helmert params:", { dx, dy, dz, rx, ry, rz, m });

// --- застосування
export function sk63z4ToWgs84(coordArray = []) {
  const wgsArray = [];
  for (const [y, x] of coordArray) {
    const [lon, lat] = proj4("SK63", "WGS84", [y, x]);
    const [X, Y, Z] = geodeticToECEF(lat, lon, 0, KRASS);

    const X2 = dx + (1 + m) * X + -rz * Y + ry * Z;
    const Y2 = dy + rz * X + (1 + m) * Y + -rx * Z;
    const Z2 = dz + -ry * X + rx * Y + (1 + m) * Z;

    // назад у геодезичні (ітерація)
    const lon2 = Math.atan2(Y2, X2);
    const p = Math.sqrt(X2 * X2 + Y2 * Y2);

    let lat2 = Math.atan2(Z2, p * (1 - 0.00669438));
    for (let i = 0; i < 5; i++) {
      const N = 6378137 / Math.sqrt(1 - 0.00669438 * Math.sin(lat2) ** 2);
      lat2 = Math.atan2(Z2, p * (1 - (0.00669438 * N) / N));
    }

    wgsArray.push([(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI]);
  }

  return wgsArray;
}

// =================================================================

// 1 51.494994 31.159013 140
// 2 51.525657 32.500554 118
// 3 51.678669 33.900568 152
// 11 49.422179 31.240523 126
// 12 49.398545 32.592473 125
// 13 49.343724 33.950651 93
// 21 46.614316 31.092164 22
// 22 46.074748 32.501527 1
// 23 44.396419 33.925787 0

//   1     5698903.784     4206988.506    114.717
//   2     5701461.986     4300154.764     96.866
//   3     5719414.881     4396990.645    133.501
//  11     5468237.381     4208738.835    100.961
//  12     5464849.651     4306827.214    101.890
//  13     5459760.597     4405528.181     72.563
//  21     5156228.487     4192272.332     -5.046
//  22     5095287.814     4300231.941    -22.623
//  23     4909752.662     4413706.609    -24.671

// 1 51.494994 31.159013  =   5698903.784     4206988.506
// 2 51.525657 32.500554  =   5701461.986     4300154.764
// 3 51.678669 33.900568  =   5719414.881     4396990.645
// 11 49.422179 31.240523  =   5468237.381     4208738.835
// 12 49.398545 32.592473  =   5464849.651     4306827.214
// 13 49.343724 33.950651  =   5459760.597     4405528.181
// 21 46.614316 31.092164  =   5156228.487     4192272.332
// 22 46.074748 32.501527  =   5095287.814     4300231.941
// 23 44.396419 33.925787  =   4909752.662     4413706.609

import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "capacitor" ? "/" : "/coord-json-parser/",
  server: {
    host: true, // або "0.0.0.0"
    port: 5173,
  },
}));

// export default defineConfig({
//   base: "/coord-json-parser/",
//   server: {
//     host: true, // або "0.0.0.0"
//     port: 5173,
//   },
// });

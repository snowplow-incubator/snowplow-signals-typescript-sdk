import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  minify: true,
});

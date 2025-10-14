import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/fmpooljs.min.js",
      format: "umd",
      name: "FMPoolJS",
      plugins: [terser()]
    }
  ]
};

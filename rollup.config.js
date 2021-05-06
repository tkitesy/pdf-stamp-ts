import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import replace from "@rollup/plugin-replace";

export default {
  input: "src/index.tsx",
  output: {
    format: "umd",
    sourcemap: false,
    file: "dist/pdfstamp.js",
  },

  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    postcss({
      modules: true,
      plugins: [autoprefixer()],
    }),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    terser(),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],
};

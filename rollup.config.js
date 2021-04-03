import fs from 'fs'
import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"
import { nodeResolve } from '@rollup/plugin-node-resolve'

const external = ["svelte/store"]

export default [
  {
    input: "src/index.ts",
    external,
    output: [
      {
        file: "dist/index.mjs",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [nodeResolve(), typescript()],
  },
  {
    input: "src/index.ts",
    external,
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
  {
    input: "src/devtools.ts",
    external,
    output: [
      {
        file: "devtools/index.mjs",
        format: "es",
        sourcemap: true,
      },
      {
        file: "devtools/index.js",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      typescript(),
      {
        writeBundle() {
          fs.writeFileSync('devtools/package.json', JSON.stringify({
            main: './index',
            module: './index.mjs',
            types: './index.d.ts'
          }, null, '  '))
        }
      }
    ],
  },
  {
    input: "src/devtools.ts",
    external,
    output: {
      file: "devtools/index.d.ts",
      format: "esm",
    },
    plugins: [dts()],
  },
]

import typescript from "@rollup/plugin-typescript"
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: "src/index.ts",
    output: {
      name: 'app',
      file: 'public/bundle.js',
      format: 'iife',
      sourcemap: true
	},
    plugins: [svelte(), resolve(), typescript()],
  },
]

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: '../',
  mount: {
    public: '/',
    src: '/_dist_',
  },
  alias: {
    "svelte-restate": "../src"
  },
  plugins: [
    '@snowpack/plugin-svelte',
    '@snowpack/plugin-typescript',
  ],
};

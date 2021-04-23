/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  workspaceRoot: '../',
  mount: {
    public: '/',
    src: '/_dist_',
  },
  plugins: [
    '@snowpack/plugin-svelte',
    '@snowpack/plugin-typescript',
  ],
};

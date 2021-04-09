const autoPreprocess = require('svelte-preprocess');

module.exports = {
  compilerOptions: {
    immutable: true
  },
  preprocess: autoPreprocess({
    defaults: {
      script: 'typescript',
    },
  }),
};

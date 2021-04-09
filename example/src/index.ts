import App from './components/App.svelte'
import { connectToDevTools } from 'svelte-restate/devtools'
import appDB from './db'
import muts from './muts'

var app = new App({
  target: document.body
})

export default app

connectToDevTools(appDB, muts)

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    app.$destroy()
  });
}

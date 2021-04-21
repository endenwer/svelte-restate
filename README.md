Immutable store for Svelte with full Typescript support and Redux Devtools integration.

## Install

```sh
npm i svelte-restate --save
```

## Usage

Create store with initial state.
```typescript
import { createStore } from 'svelte-restate'

export interface State {
  count: number
}

const initState: State = {
 count: 0,
}

export default createStore(initState)
```

Create subscriptions. See more examples in documentation for [`RegRootsub`](#reg-root-sub) and [`RegSub`](#reg-sub).
```typescript
import store from './store'

const count = store.regRootSub(
  'count,
  ($root) => $root.count
)

export default { count }
```

Create mutations. See more examples in documentation for [`RegMut`](#reg-mut).
```ts
import store from './store'

const increaseCount  = store.regMut(
  increaseCount,
  (draft) => draft.count += 1
)
export default { increaseCount }
```

Use in svelte component.
```ts
<script>
  import muts from './muts'
  import subs from './subs'

  const count = subs.count()
</script>

<div on:click={muts.increaseCount()}>{$count}</div>
```

Connect to Redux devtools. See documentation for [`connectToDevtools`](#connect-to-devtools).
```ts
import muts from './muts'
import store from './store'

connectToDevTools(store, muts)
```

See more examples in demo.

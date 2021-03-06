## Svelte Restate

Immutable store for Svelte with full Typescript support and Redux Devtools integration. It is highly inspired by [re-frame](https://github.com/day8/re-frame) subscriptions(read more about signal graph and subscription layers [here](https://day8.github.io/re-frame/subscriptions/)). [Immer](https://immerjs.github.io/immer/) is used to work with immutable state.

<a id=install></a>
## Install

```sh
npm i svelte-restate --save
```

<a id=usage></a>
## Usage [[Demo]](https://svelte-restate-example.netlify.app/)

Create store with initial state.
```ts
import { createStore } from 'svelte-restate'

export interface State {
  isLoading
  todos: {
    id: number
    completed: boolean
    description: string
  }[]
}

const initState: State = {
  isLoading: true,
  todos: []
}

export default createStore(initState)
```

Create subscriptions. See more examples in documentation for [`RegRootsub`](/docs/API.md#reg-root-sub) and [`RegSub`](/docs/API.md#reg-sub).
```ts
import store from './store'

// register root subs
const isLoading = store.regRootSub(
  'isLoading',
  ($root) => $root.count
)

const todos = store.regRootSub(
  'todos',
  ($root) => $root.todos
)

// use root subs to register derived subs
const completedTodos = store.regSub(
  'completedTodos',
  () => todos()
  ($todos) => $todos.filter(todo => todo.completed)
)

// register sub with arguments
const todo = store.regSub(
  'todo',
  () => todos()
  ($todos, [id]: [number]) => $todos.find(todo => todo.id === id)
)

export default { count }
```

Create mutations. See more examples in documentation for [`RegMut`](/docs/API.md#reg-mut).
```ts
import store from './store'

const setLoading = store.regMut<boolean>(
  'setLoading',
  (draft, value) => draft.isLoading = value
)

const insertTodos = store.RegMut<Todo[]>(
  'insertTodos',
  (draft, todos) => draft.todos = todos
)

export default { setLoading, insertTodos }
```

Use in svelte component.
```html
<script>
  import muts from './muts'
  import subs from './subs'
  import store from './store'
  import { onMount } 'svelete'
  import { fetchTodos } './api'

  // subscription without arguments.
  // To get the value use '$isLoading'
  const isLoading = subs.isLoading()

  // subscription with arguments
  export let id: number
  $: todo = subs.todo(id)

  // use mutations
  onMount(async () => {
   muts.setLoading(true)
   const todos = await fetchTodos()

   // call multiple mutations within transaction
   store.transaction(tx => [
     muts.setIsLoading(false, tx),
     muts.insertTodos(todos, tx)
   ])
  })
</script>

{# if $isLoading}
  <div>Loading...</div>
{:else}
  <div>{$todo.description}</div>
{/if}
```

Connect to Redux devtools. You can see main state, state of all active subscriptions and dispatch mutations directly from the devtools. Time travel also works. See documentation for [`connectToDevtools`](/docs/API.md#connect-to-devtools).
```ts
import muts from './muts'
import store from './store'

connectToDevTools(store, muts)
```

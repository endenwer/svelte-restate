# API

## svelte-restate

### `createStore`

```ts
createStore<T>(initState: T): Restate<T>
```

Create new store with `initialState`.

```ts
import { createStore } from 'svelte-restate'

export interface State {
  isLoading: boolean
  todos: {
    id: string
    description: string
    completed: boolean
  }[]
}

const initState: State = {
 isLoading: true,
 todos: []
}

export default createStore(initState)
```

## svelte-restate/devtools

### `connectToDevtools`

Connects to Redux Devtools

```
connectToDevTools(store: Restate<any>, muts: {[key: string]: Function} = {})
```

## `Restate<T>`

State object returned by `createState`.

### `root`

Root subscription.

### `regRootSub`

```ts
regRootSub<V, Args extends any[]>(name: string, computationFn: (values: StoresValues<Subscription<T>>, args: Args) => V): (...args: Args) => Subscription<V>
```

Creates new root subscription and cache it. The returned function will accept subscription's arguments and will create new subscription on first call and return cached subscription on consecitive calls.

Parameters:

* `name` - name of the subscription
* `computationFn` - this function will receive root state as first paramenter and arguments as the second. It should calculate subscription value and return it

```ts
import store from './store'

const todos = store.regRootSub(
  'todos',
  ($root) => $root.todos
)

export default {
  todos,
}
```

### `regSub`

```ts
regSub<V, S extends Subscriptions, Args extends any[]>(name: string, inputStoresFn: (args: Args) => S, computationFn: (values: StoresValues<S>, args: Args) => V): (...args: Args) => Subscription<V>
```

Works like `ReguRootSub`, but accept `inputStoresFn` as the second arguments.

Parameters:

* `name` - name of the subscription
* `inputStoresFn` - accept subscription's arguments and returns subscriptions
* `computationFn` - this function will receive root state as first paramenter and arguments as the second. It should calculate subscription value and return it.

```ts
import store from './store'

// you can register subscription without paramenters
const activeTodos = store.regSub(
  'activeTodos'
  () => todos(),
  ($todos) => $todos.filter(todo => !todo.completed)
)

// and with parameters
const todo = store.regSub(
  'todo',
  () => todos(),
  ($todos, [id]: [string]) => {$todos.find(todo => todo.id === id)}
)

// also you can pass paramenter to inputstoresfn
const todoDescriptionLenght = store.RegSub(
  'todoDescriptionLenght',
  ([id]: [string]) => todos(id),
  ($todo) => $todo.description.lenght
)

// or to both functions
const isTodoIncludesString = store.RegSub(
  'isTodoIncludesString',
  ([id, str]: [string, string]) => todos(id),
  ($todo, [_, str]: [string, string]) => $todo.description.includes(str)
)
```

### `regMut`

Registers new mutation handler.

```ts
regMut(name: string, handler: (draft: Draft<T>) => void): MutHandler<T>
```

```ts
regMut<Params>(name: string, handler: (draft: Draft<T>, params: Params) => void): MutHandlerWithParams<T, Params>
```

Paramenters:

* `name` - name of the mutation
* `handler` - mutation handler, it will receive root state with paramenters. This function should mutate `draft`. You can read more about update patters in Immer documentation https://immerjs.github.io/immer/update-patterns.

```ts
import store from './store'

const setLoading = store.regMut<boolean>(
  'setLoading',
  (draft, value) => draft.isLoading = value
)

const addTodo = store.regMut<Todo>(
  'insertProjects',
  (draft, todo) => {
    draft.todos.push(todo)
  }
)

export default {
  setLoading,
  addTodo
}

### `transaction`

Execute multiple mutations within transaction.

```ts
transaction(fn: (tx: Transaction<T>) => MutReturnValue[]): void
```

Paramenters:

* `fn` - transaction function, should return an array of mutations

```ts
import muts from './muts'
import subs from './subs'
import store from './store'

export function loadTodos() {
  muts.setLoading(true)
  const [ids, entities] = fetchTodos()

  store.transaction((tx) => [
    muts.setLoading(false, tx),
    muts.insertTodos([ids, entities], tx)
 ])
}
```

### `listenMuts`

```ts
listenMuts(handler: (name: string, params: unknown) => void): Unsubscriber
```

Listens for mutations.

Paramenters:

* `handler` - receives mutation name and parameters

```ts
import store from './store'

store.listenMuts((name, params) => {
  console.log(name, params)
})
```

### `listenSubs`

```ts
listenSubs(handler: (action: 'SUB_CREATED' | 'SUB_DELETED', params: unknown) => void): Unsubscriber
```

Listens for subscription creation and removal.

Paramenters:

* `handler` - receives action name and parameters

```ts
import store from './store'

store.listenSubs((action, params) => {
  console.log(name, params)
})
```

### `set`

Directy mutates state. It is recomended to use mutation when you need to change state. This function is used for integration with Redux Devtools.

### `getRunningSubsState`

Returns states of all cached subscriptions.

```ts
getRunningSubsState(): {[key: string]: any}
```

## `Subscription<T>`

### `getState`

Returns subscription's state.

```ts
getState: () => T
```



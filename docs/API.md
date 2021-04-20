# API

* [svelte-restate](#svelte-restate)
  * [createStore()](#create-store)
* [svelte-restate/devtools](#svelte-restate-devtools)
  * [connectTodevtools()](#connect-to-devtools)
* [Restate instance](#restate)
  * [root](#root)
  * [regRootsub()](#reg-root-sub)
  * [regSub()](#reg-sub)
  * [regMut()](#reg-mut)
  * [transaction()](#transaction)
  * [listenSubs()](#listen-subs)
  * [listenMuts()](#listen-muts)
  * [set()](#set)
  * [getRunningSubsState()](#get-running-subs-state)
* [Subscription instance](#statics)
  * [subscribe()](#subscribe)
  * [getState()](#get-state)

<a id=svelte-restate></a>
## svelte-restate

<a id=create-store></a>
### `createStore<T>(initState: T): Restate<T>`

Creates new store with initial state. See [`Restate<T>` documentation](#restate-object-api).

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

<a id=svelte-restate-devtools></a>
## svelte-restate/devtools

<a id=connect-to-devtools></a>
### `connectToDevTools(store: Restate<any>, muts: {[key: string]: Function} = {})`

Connects to Redux Devtools. To dispatch mutaions from devtools you need to pass mutaions object as second argument.

<a id=restate></a>
## `Restate<T>`

State object returned by [`createState`](#create-state).

<a id=root></a>
### `root`

Root subscription.

<a id=reg-root-sub></a>
### `regRootSub<V, Args extends any[]>(name: string, computationFn: (values: StoresValues<Subscription<T>>, args: Args) => V): (...args: Args) => Subscription<V>`

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

<a id=reg-sub></a>
### `regSub<V, S extends Subscriptions, Args extends any[]>(name: string, inputStoresFn: (args: Args) => S, computationFn: (values: StoresValues<S>, args: Args) => V): (...args: Args) => Subscription<V>`

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

<a id=reg-mut></a>
### `regMut(name: string, handler: (draft: Draft<T>) => void): MutHandler<T>`
### `regMut<Params>(name: string, handler: (draft: Draft<T>, params: Params) => void): MutHandlerWithParams<T, Params>`

Registers new mutation handler.

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

<a id=transaction></a>
### `transaction(fn: (tx: Transaction<T>) => MutReturnValue[]): void`

Execute multiple mutations within transaction.

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

<a id=listen-subs></a>
### `listenSubs(handler: (action: 'SUB_CREATED' | 'SUB_DELETED', params: unknown) => void): Unsubscriber`

Listens for subscription creation and removal.

Paramenters:

* `handler` - receives action name and parameters

```ts
import store from './store'

store.listenSubs((action, params) => {
  console.log(name, params)
})
```

<a id=listen-muts></a>
### `listenMuts(handler: (name: string, params: unknown) => void): Unsubscriber`

Listens for mutations.

Paramenters:

* `handler` - receives mutation name and parameters

```ts
import store from './store'

store.listenMuts((name, params) => {
  console.log(name, params)
})
```

<a id=set></a>
### `set(value: T)`

Directy mutates state. It is recomended to use mutation when you need to change state. This function is used for integration with Redux Devtools.

<a id=get-running-subs-state></a>
### `getRunningSubsState(): {[key: string]: any}`

Returns states of all cached subscriptions.

<a id=subscription></a>
## `Subscription<T>`

<a id=subscribe></a>
### `subscribe(fn: (T) => void): () => void`

Subscribes to subscription.

<a id=get-state></a>
### `getState: () => T`

Returns subscription's state.
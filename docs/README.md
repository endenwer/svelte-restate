## Features
- Fully typed with Typescript
- Immutable data
- Integration with Redux Devtools. In addition to see store data, you can also see values of all active subscriptions
- Layered subscriptions with lazy initialization
- Mutations with transaction support

## Install
```sh
npm i svelte-restate --save
```
or
```sh
yarn add svelte-restate
```

## Usage

### Create store with initial state.
- Normalize your data before storing it
- Define interface for you store
- Define initial state

```typescript
import {createStore} from 'svelte-restate'

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

### Register subscriptions
- Read more about different levels of subscriptions in re-frame

```typescript
import store from './store'

// register root subscription
const todos = store.regRootSub(
  'todos',
  ($root) => $root.todos
)

// register subscription without params
const activeTodos = store.regSub(
  'activeTodos'
  () => todos(),
  ($todos) => $todos.filter(todo => !todo.completed)
)

// register subscription with params
const todo = store.regSub(
  'todo',
  () => todos(),
  ($todos, [id]: [string]) => {$todos.find(todo => todo.id === id)}
)

export default {
  todos,
  activeTodos,
  todo
}
```

### Register mutations
You need to mutate `draft` object. Read about how to do it right in immer documentation.

```typescript
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
```

### Use subscriptions/mutations in components
- If you need to mutate store syncrhoniosly just call a mutation
- If you need to do async data loading, define interactor and call mutaions from it

```html
// App.svelte

<script>
  import Projects from 'Projects.svelte'
  import subs from './subs'
  import { loadProjects } from './interactors'
  import { onMount } from 'svelte'

  const isLoading = subs.isLoading()

  onMount(loadProjects)
</script>

{#if $isLoading}
  <div>Loading...</div>
{:else}
  <Projects/>
{/if}
```

```html
// Projects.svelte

<script>
  import Project from 'Projects.svelte'
  import subs from './subs'

  const projectIds = subs.projectIds()
</script>

<h1>Projects</h1>

{#each projectIds as id (id)}
  <Project {id} />
{/each}
```

```html
// Project.svelte

<script>
  import subs from './subs'
  import muts from './muts'

  let id: number
  $: project = subs.project(id)
</script>

<div>
  <h2>Project ##{project.id}</h2>
  <input type="text" value={project.name} on:change={(e) => muts.changeProjectName(id, e.currentTarget.value)} />
</div>
```

## Documentation
## Additional resources

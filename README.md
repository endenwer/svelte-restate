## Features
- Fully typed with Typescript
- Immutable data
- Integration with Redux Devtools. In addition to see store data, you can also see values of all active subscriptions
- Layered subscriptions with lazy initialization
- No impilit undefined value in subscriptions
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
// store.ts

import {createStore} from 'svelte-restate'

export interface State {
  isLoading: boolean
  projectIds: number[]
  projectEntities: ProjectEntities[]
}

type Projectentities = Record<number, Project | undefined>

interface Project {
  id: number
  name: string
}

const initState: State = {
 isLoading: true,
 projectsIds: [],
 projectentities: {}
}

export default createStore(initState)
```

### Register subscriptions
- Read more about different levels of subscriptions in re-frame

```typescript
// subs.ts

import store from './store'

const isLoading = appDB.regRootSub(
  'isLoading',
  ($root) => $root.isLoading
)

const projectEntities = appDB.regRootSub(
  'projectEntities',
  ($root) => $root.projectentities
)

const projectIds = appDB.regRootSub(
  projectIds,
  ($root) => $root.projectIds
)

const project = appDB.regSub(
  () => projectentities(),
  ($entities, [id]: [number]) => $entities[id]
)

export default {
  isLoading,
  projectIds,
  project
}
```

### Register mutations
You need to mutate `draft` object. Read about how to do it right in immer documentation.

```typescript
// muts.ts

import store from './store'

const setLoading = store.regMut<boolean>(
  'setLoading',
  (draft, value) => draft.isLoading = value
)

const insertProjects = store.regMut<[number[], Projectentities]>(
  'insertProjects',
  (draft, [ids, entities]) => {
    draft.projectIds = ids
    draft.projectEntities = entities
  }
)

const changeProjectName = store.regMut<[number, string]>(
  'changeProjectName',
  (draft, [id, name]) => {
    const project = draft.projectentities[id]
    if (!project) return
    project.name = name
  }
)

export default {
  setLoading,
  insertProjects,
  changeProjectName
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

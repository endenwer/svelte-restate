<script lang="ts">
  import { onMount } from 'svelte'
  import { addTodo, loadTodos } from '../interactors'
  import subs from '../subs'
  import muts from '../muts'
  import Todos from './Todos.svelte'
  import type { Filter } from '../db'

  const isLoading = subs.isLoading()

  function createTodo(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement
    if (event.key === 'Enter') {
      addTodo(input.value)
      input.value = ''
    }
  }

  function handleHashChange() {
    let filter: Filter = 'all'
    if (window.location.hash === '#/active') {
      filter = 'active'
    } else if (window.location.hash === '#/completed') {
      filter = 'completed'
    }
    muts.setFilter(filter)
  }

  onMount(handleHashChange)
  onMount(loadTodos)
</script>

<svelte:window on:hashchange={handleHashChange} />

<header class="header">
  <h1>todos</h1>
  <input class="new-todo" on:keydown={createTodo} placeholder="What needs to be done?" autofocus>
</header>

{#if $isLoading}
  <div>Loading...</div>
{:else}
  <Todos/>
{/if}

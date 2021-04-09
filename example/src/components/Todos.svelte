<script lang="ts">
  import Todo from './Todo.svelte'
  import { toggleAll, clearCompleted } from '../interactors'
  import subs from '../subs'

  const activeCount = subs.activeCount()
  const completedCount = subs.completedCount()
  const visibleTodoIds= subs.visibleTodoIds()
  const filter = subs.filter()
</script>

<section class="main">
  <input id="toggle-all" class="toggle-all" type="checkbox" on:change={toggleAll} checked={$activeCount === 0}>
  <label for="toggle-all">Mark all as complete</label>

  <ul class="todo-list">
    {#each $visibleTodoIds as id (id)}
      <Todo {id} />
    {/each}
  </ul>

  <footer class="footer">
    <span class="todo-count">
      <strong>{$activeCount}</strong> {$activeCount === 1 ? 'item' : 'items'} left
    </span>

    <ul class="filters">
      <li><a class:selected={$filter === 'all'} href="#/">All</a></li>
      <li><a class:selected={$filter === 'active'} href="#/active">Active</a></li>
      <li><a class:selected={$filter === 'completed'} href="#/completed">Completed</a></li>
    </ul>

    {#if $completedCount}
      <button class="clear-completed" on:click={clearCompleted}>
        Clear completed
      </button>
    {/if}
  </footer>
</section>

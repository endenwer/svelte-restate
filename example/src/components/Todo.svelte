<script lang="ts">
  import subs from '../subs'
  import muts from '../muts'
  import type { Todo } from '../db'
  import { deleteTodo, editTodo, toggleTodo } from '../interactors'

  export let todo: Todo
  let inputValue = ''

  const editingTodoId = subs.editingTodoId()

  function showInput() {
    inputValue = todo.description
    muts.setEditingTodo(todo.id)
  }

  function handleEdit(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      editTodo(todo.id, inputValue)
      inputValue = ''
    }
    else if (event.key === 'Escape') muts.setEditingTodo(null);
  }
</script>

<li class:completed={todo.completed} class:editing={todo.id === $editingTodoId}>
  <div class="view">
    <input class="toggle" type="checkbox" on:change={() => toggleTodo(todo.id)} checked={todo.completed}>
    <label on:dblclick={showInput}>{todo.description}</label>
    <button on:click="{() => deleteTodo(todo.id)}" class="destroy"></button>
  </div>

  {#if todo.id === $editingTodoId}
    <input
      bind:value={inputValue}
      id="edit"
      class="edit"
      on:keydown={handleEdit}
      autofocus
    >
  {/if}
</li>

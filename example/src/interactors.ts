import type { TodoEntities } from './db'
import muts from './muts'
import subs from './subs'
import appDB from './db'

export function loadTodos() {
  muts.setLoading(true)
  const [ids, entities] = fetchTodos()

  console.log('loaded')
  appDB.transaction((tx) => [
    muts.setLoading(false, tx),
    muts.insertTodos([ids, entities], tx)
 ])
}

export function addTodo(description: string) {
  const todo = {
    id: uuid(),
    completed: false,
    description
  }
  muts.addTodo(todo)
  saveTodos()
}

export function editTodo(id: string, description: string) {
  appDB.transaction(tx => [
    muts.editTodo([id, description], tx),
    muts.setEditingTodo(null, tx)
  ])
  saveTodos()
}

export function toggleTodo(id: string){
  muts.toggleTodo(id)
  saveTodos()
}

export function toggleAll() {
  const activeCount = subs.activeCount().getState()
  muts.toggleAll(activeCount !== 0)
  saveTodos()
}

export function clearCompleted() {
  muts.clearCompleted()
  saveTodos()
}

export function deleteTodo(id: string) {
  muts.deleteTodo(id)
  saveTodos()
}

function fetchTodos(): [string[], TodoEntities] {
  const data = localStorage.getItem('todos-svelte')
  if (data) {
    const parsed = JSON.parse(data)
    return [parsed.ids, parsed.entities]
  }
  return [[], {}]
}

function saveTodos() {
  const ids = subs.todoIds().getState()
  const entities = subs.todoEntities().getState()
  if (ids && entities) {
    localStorage.setItem('todos-svelte', JSON.stringify({ids, entities}))
  }
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

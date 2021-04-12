import appDB from './db'
import type { Filter, Todo, TodoEntities } from './db'

const setLoading = appDB.regMut<boolean>(
  'setLoading',
  (draft, value) => {draft.isLoading = value}
)

const setFilter = appDB.regMut<Filter>(
  'setFilter',
  (draft, value) => {draft.filter = value}
)

const setEditingTodo = appDB.regMut<string | null>(
  'setEditingTodo',
  (draft, id) => {draft.editingTodoId = id}
)

const insertTodos = appDB.regMut<[string[], TodoEntities]>(
  'insertTodos',
  (draft, [ids, entities]) => {
    draft.todoIds = ids
    draft.todoEntities = entities
  }
)

const addTodo = appDB.regMut<Todo>(
  'addTodo',
  (draft, todo) => {
    draft.todoIds.push(todo.id)
    draft.todoEntities[todo.id] = todo
  }
)

const editTodo = appDB.regMut<[string, string]>(
  'editTodo',
  (draft, [id, description]) => {
    const todo = draft.todoEntities[id]
    if (!todo) return
    todo.description = description
  }
)

const toggleTodo = appDB.regMut<string>(
  'toogleTodo',
  (draft, id) => {
    const todo = draft.todoEntities[id]
    if (!todo) return
    todo.completed = !todo.completed
  }
)

const toggleAll = appDB.regMut<boolean>(
  'toggleAll',
  (draft, value) => {
    draft.todoIds.forEach(id => {
      const todo = draft.todoEntities[id]
      if (todo) {
        todo.completed = value
      }
    })
  }
)

const clearCompleted = appDB.regMut(
  'clearCompleted',
  (draft) => {
    draft.todoIds = draft.todoIds.filter(id => {
      const todo = draft.todoEntities[id]
      if (todo && todo.completed) {
        delete draft.todoEntities[id]
        return false
      }
      return true
    })
  }
)

const deleteTodo = appDB.regMut<string>(
  'deleteTodo',
  (draft, id) => {
    const todo = draft.todoEntities[id]
    if (!todo) return
    delete draft.todoEntities[id]
    draft.todoIds = draft.todoIds.filter((i) => i !== id)
  }
)

export default {
  setLoading,
  setFilter,

  setEditingTodo,
  insertTodos,
  addTodo,
  editTodo,
  toggleTodo,
  toggleAll,
  deleteTodo,
  clearCompleted
}

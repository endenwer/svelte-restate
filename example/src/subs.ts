import appDB from './db'
import type { Todo } from './db'

const isLoading = appDB.regRootSub(
  'isLoading',
  ($root) => $root.isLoading
)

const filter = appDB.regRootSub(
  'filter',
  ($root) => $root.filter
)

const editingTodoId = appDB.regRootSub(
  'editinTodoId',
  ($root) => $root.editingTodoId
)

const todoIds = appDB.regRootSub(
  'toodIds',
  ($root) => $root.todoIds
)

const todoEntities = appDB.regRootSub(
  'todosEntities',
  ($root) => $root.todoEntities
)

const todos = appDB.regSub(
  'todos',
  () => [todoIds(), todoEntities()],
  ([$todoIds, $todoEntities]) => {
    return $todoIds.reduce((todos: Todo[], id) => {
      const todo = $todoEntities[id]
      return todo ? [...todos, todo] : todos
    }, [])
  }
)

const visibleTodos = appDB.regSub(
  'visibleTodos',
  () => [filter(), todos()],
  ([$filter, $todos]) => {
    if ($filter === 'all') {
      return $todos
    }

    if ($filter === 'active') {
      return $todos.filter(todo => !todo.completed)
    }

    return $todos.filter(todo => todo.completed)
  }
)

const completedCount = appDB.regSub(
  'completedCount',
  () => todos(),
  ($todos) => $todos.filter(todo => todo.completed).length
)

const activeCount = appDB.regSub(
  'activeCount',
  () => [todos(), completedCount()],
  ([$todos, $completedCount]) => $todos.length - $completedCount
)

export default {
  isLoading,
  filter,
  editingTodoId,
  todoIds,
  todoEntities,
  visibleTodos,
  completedCount,
  activeCount
}

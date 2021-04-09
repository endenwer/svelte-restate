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
      if (todo) return [...todos, todo]
      return todos
    }, [])
  }
)

const visibleTodoIds = appDB.regSub(
  'visibleTodoIds',
  () => [filter(), todos()],
  ([$filter, $todos]) => {
    if ($filter === 'all') {
      return $todos.map(todo => todo.id)
    }

    if ($filter === 'active') {
      return $todos.reduce((ids: string[], todo: Todo | undefined) => {
        if (todo && !todo.completed) return [...ids, todo.id]
        return ids
      }, [])
    }

    return $todos.reduce((ids: string[], todo: Todo | undefined) => {
      if (todo && todo.completed) return [...ids, todo.id]
      return ids
    }, [])
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

const todo = appDB.regSub(
  'todo',
  () => todoEntities(),
  ($todoEntities, [id]: [string]) => {
    return $todoEntities[id]
  }
)

export default {
  isLoading,
  filter,
  editingTodoId,
  todoIds,
  todoEntities,
  visibleTodoIds,
  todo,
  completedCount,
  activeCount
}

import { createStore } from 'svelte-restate'

export interface State {
  isLoading: boolean
  filter: Filter
  todoIds: string[]
  editingTodoId: string | null
  todoEntities: TodoEntities
}

export type Filter = 'all' | 'active' | 'completed'
export type TodoEntities = {[key: string]: Todo | undefined}

export interface Todo {
  id: string
  description: string
  completed: boolean
}

const initState: State = {
  isLoading: true,
  filter: 'all',
  todoIds: [],
  editingTodoId: null,
  todoEntities: {}
}

export default createStore(initState)

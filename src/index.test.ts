import * as assert from 'assert'
import { createStore } from './index'

interface Project {
  id: number
  name: string
}

interface State {
  isLoading: boolean
  projects: Record<number, Project | undefined>
}

const initState: State = {
  isLoading: true,
  projects: {
    1: {
      id: 1,
      name: 'project1'
    }
  }
}

describe('createStore', () => {
  describe('regSub', () => {
    it('registers new subscription without params', () => {
      const store = createStore(initState)
      const isLoadingSub = store.regSub(
        'isLoading',
        () => store.root,
        ($root) => $root.isLoading
      )

      const values: boolean[] = []
      isLoadingSub().subscribe(value => values.push(value))

      assert.deepStrictEqual(values, [true])
    })

    it('registes new subscription with params', () => {
      const store = createStore(initState)
      const project = store.regSub(
        'project',
        () => store.root,
        ($root, [id]: [number]) => $root.projects[id]
      )

      const values: Project[] = []
      project(1).subscribe(value => values.push(value))
      assert.deepStrictEqual(values, [{id: 1, name: 'project1'}])
    })

    it('caches subscription', () => {
      const store = createStore(initState)
      const isLoadingSub = store.regSub(
        'isLoading',
        () => store.root,
        ($root) => $root.isLoading
      )

      assert.deepStrictEqual(Object.keys(store.getRunningSubsState()), [])

      const unsubscribe1 = isLoadingSub().subscribe(() => {})
      const sub1 = store.getRunningSubsState()['isLoading']
      const unsubscribe2 = isLoadingSub().subscribe(() => {})
      const sub2 = store.getRunningSubsState()['isLoading']

      assert.strictEqual(sub1, sub2)
      assert.deepStrictEqual(Object.keys(store.getRunningSubsState()), ['isLoading'])
      unsubscribe1()
      assert.deepStrictEqual(Object.keys(store.getRunningSubsState()), ['isLoading'])
      unsubscribe2()
      assert.deepStrictEqual(Object.keys(store.getRunningSubsState()), [])
    })

    it('does not allow subscription to return undefined', () => {
      const store = createStore(initState)
      const project = store.regSub(
        'project',
        () => store.root,
        ($root, [id]: [number]) => $root.projects[id]
      )

      assert.throws(() => project(2).subscribe(() => {}), /Subscription "project" with params \[2\] have undefined value./)
    })
  })

  describe('regRootSub', () => {
    it('registers new root subscription without params', () => {
      const store = createStore(initState)
      const isLoadingSub = store.regRootSub(
        'isLoading',
        ($root) => $root.isLoading
      )

      const values: boolean[] = []
      isLoadingSub().subscribe(value => values.push(value))

      assert.deepStrictEqual(values, [true])
    })

    it('registes new root subscription with params', () => {
      const store = createStore(initState)
      const project = store.regRootSub(
        'project',
        ($root, [id]: [number]) => $root.projects[id]
      )

      const values: Project[] = []
      project(1).subscribe(value => values.push(value))
      assert.deepStrictEqual(values, [{id: 1, name: 'project1'}])
    })
  })

  describe('subscription.getState', () => {
    it('returns value of subscription', () => {
      const store = createStore(initState)
      const isLoadingSub = store.regRootSub(
        'isLoading',
        ($root) => $root.isLoading
      )

      const value =  isLoadingSub().getState()

      assert.deepStrictEqual(value, true)
      assert.deepStrictEqual(Object.keys(store.getRunningSubsState()), ['isLoading'])

      const unsubscribe = isLoadingSub().subscribe(() => {})
      assert.deepStrictEqual(Object.keys(store.getRunningSubsState()), ['isLoading'])
      unsubscribe()
      assert.deepStrictEqual(Object.keys(store.getRunningSubsState()), [])
    })
  })

  describe('regMut', () => {
    it('registers new mutaiton without params', () => {
      const store = createStore(initState)
      const isLoadingSub = store.regSub('isLoading', () => store.root, ($root) => $root.isLoading)
      const toggleIsLoading = store.regMut(
        'toggleIsLoading',
        (draft) => {
          draft.isLoading = !draft.isLoading
        }
      )

      const values: boolean[] = []
      const unsubscribe = isLoadingSub().subscribe(value => values.push(value))

      assert.deepStrictEqual(values, [true])
      toggleIsLoading()
      assert.deepStrictEqual(values, [true, false])
      unsubscribe()
    })

    it('registers new mutation with params', () => {
      const store = createStore(initState)
      const isLoadingSub = store.regSub('isLoading', () => store.root, ($root) => $root.isLoading)
      const setIsLoading = store.regMut<boolean>(
        'setIsLoading',
        (draft, value) => {
          draft.isLoading = value
        }
      )

      const values: boolean[] = []
      const unsubscribe = isLoadingSub().subscribe(value => values.push(value))

      assert.deepStrictEqual(values, [true])
      setIsLoading(false)
      assert.deepStrictEqual(values, [true, false])
      unsubscribe()
    })
  })

  describe('transation', () => {
    it('applyes multiple mutaions at once', () => {
      const store = createStore(initState)
      const rootSub = store.regSub('root', () => store.root, ($root) => $root)
      const toggleIsLoading = store.regMut(
        'setIsLoading',
        (draft) => {
          draft.isLoading = !draft.isLoading
        }
      )
      const addProject = store.regMut<Project>(
        'addProject',
        (draft, project) => {
          draft.projects[project.id] = project
        }
      )

      const values: State[] = []
      rootSub().subscribe(value => values.push(value))
      assert.deepStrictEqual(values, [initState])

      const newProject = {id: 2, name: 'project2'}
      const newState = {...initState, isLoading: false, projects: {...initState.projects, 2: newProject}}
      store.transaction((tx) => [
        toggleIsLoading(tx),
        addProject(newProject, tx)
      ])
      assert.deepStrictEqual(values, [initState, newState])
    })

    it('throws an error when transaction is not passed to mutaions', () => {
      const store = createStore(initState)
      const isLoadingSub = store.regSub('root', () => store.root, ($root) => $root)
      const toggleIsLoading = store.regMut(
        'toggleIsLoading',
        (draft) => {
          draft.isLoading = !draft.isLoading
        }
      )
      isLoadingSub().subscribe(() => {})

      const runTransaction = () => {
        store.transaction((_tx) => [
          toggleIsLoading()
        ])
      }

      assert.throws(runTransaction, /Attempt to call mutation with name "toggleIsLoading" inside transaction without passing transaction object./)
    })
  })

  describe('listenMuts', () => {
    it('listens mutations', () => {
      const store = createStore(initState)
      let value: {name: string, params: boolean} | null = null

      const unsubscibeListener = store.listenMuts((name, params) => value = {name, params: params as boolean})
      const setIsLoading = store.regMut<boolean>(
        'setIsLoading',
        (draft, value) => {
          draft.isLoading = value
        }
      )
      setIsLoading(false)

      assert.deepStrictEqual(value, {name: 'setIsLoading', params: false})

      value = null
      unsubscibeListener()
      setIsLoading(true)
      assert.deepStrictEqual(value, null)
    })
  })

  describe('listenSubs', () => {
    it('listens subs', () => {
      const store = createStore(initState)
      let value: {action: string, name: string} | null = null
      const isLoadingSub = store.regSub('isLoading', () => store.root, ($root) => $root.isLoading)

      const unsubscibeListener = store.listenSubs((action, name) => value = {action, name})
      const unsubscribe = isLoadingSub().subscribe(() => {})

      assert.deepStrictEqual(value, {name: 'isLoading', action: 'SUB_CREATED'})
      unsubscribe()
      assert.deepStrictEqual(value, {name: 'isLoading', action: 'SUB_DELETED'})

      value = null
      unsubscibeListener()
      isLoadingSub().subscribe(() => {})
      assert.deepStrictEqual(value, null)
    })
  })
})

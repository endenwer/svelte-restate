import type { Readable } from 'svelte/store'
import type { Draft } from 'immer'
import { produce, createDraft, finishDraft } from 'immer'
import { derived, writable, get } from  'svelte/store'

export interface Restate<T> {
  regSub<V, S extends Subscriptions, Args extends any[]>(
    name: string,
    inputStoresFn: (args: Args) => S,
    computationFn: (values: StoresValues<S>, args: Args) => V | undefined
  ): (...args: Args) => Subscription<V>

  regRootSub<V, Args extends any[]>(
    name: string,
    computationFn: (values: StoresValues<Subscription<T>>, args: Args) => V | undefined
  ): (...args: Args) => Subscription<V>

  regMut(name: string, handler: (draft: Draft<T>) => void): MutHandler<T>
  regMut<Params>(name: string, handler: (draft: Draft<T>, params: Params) => void): MutHandlerWithParams<T, Params>

  transaction(fn: (tx: Transaction<T>) => MutReturnValue[]): void

  listenMuts(handler: MutListener): Unsubscriber
  listenSubs(handler: SubListener): Unsubscriber

  getRunningSubsState(): {[key: string]: any}

  set(value: T): void
  root: Subscription<T>
}

type Unsubscriber = () => void
type Subscriber<T> = (value: T) => void
type Invalidator<T> = (value?: T) => void

interface Subscription<T> extends Readable<T> {
  getState: () => T | undefined
}

type Subscriptions = Subscription<any> | [Subscription<any>, ...Array<Subscription<any>>]

type StoresValues<T> = T extends Readable<infer U> ? U : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never }

interface RunningSubs {
  [name: string]: {
    subscribersCount: number
    store: Subscription<any>
  } | undefined
}

type SubListenerAction = 'SUB_CREATED' | 'SUB_DELETED'
type SubListener = (action: SubListenerAction, name: string) => void

interface Transaction<T> {
  __draft: Draft<T>
}

interface MutReturnValue {
  name: string
  params: unknown
  isInsideTx: boolean
}

type MutHandlerWithParams<T, Params> = (params: Params, tx?: Transaction<T>) => MutReturnValue
type MutHandler<T> = (tx?: Transaction<T>) => MutReturnValue
type MutListener = (name: string, params: unknown) => void

export function createStore<T>(initState: T): Restate<T> {
  const store = writable(initState)
  const runningSubs: RunningSubs = {}
  const mutListeners: MutListener[] = []
  const subListeners: SubListener[] = []

  const root = {
    subscribe: store.subscribe,
    getState: () => {
      return get(store)
    }
  }

  function update(fn: (draft: Draft<T>) => void) {
    store.update(state => produce(state, fn))
  }

  function cleanSubCache(path: string) {
    const sub = runningSubs[path]
    if (!sub) return

    sub.subscribersCount -= 1
    if (sub.subscribersCount === 0) {
      delete runningSubs[path]
      runSubListeners('SUB_DELETED', path)
    }
  }

  function getSubPath(name: string, args: unknown[]): string {
    let path: string
    if (args.length === 0) {
      path = name
    } else if (typeof args === 'object') {
      path = `${name}/${JSON.stringify(args)}`
    } else {
      path = `${name}/${args}`
    }

    return path
  }

  function regSub<V, S extends Subscriptions, Args extends any[]>(
    name: string,
    inputStoresFn: (args: Args) => S,
    computationFn: (values: StoresValues<S>, args: Args) => V | undefined
  ): (...args: Args) => Subscription<V> {

    return (...args: Args) => {
      const subPath = getSubPath(name, args)
      const cache = runningSubs[subPath]
      if (cache) {
        return cache.store
      }

      const stores = inputStoresFn(args)
      const handler = (values: StoresValues<S>, setFn: (value: V) => void) => {
        const result = computationFn(values, args) as V
        setFn(result)
      }

      const derivedStore = derived(stores, handler)
      const currentStore: Subscription<V> = {
        subscribe: (run: Subscriber<V>, invalidate?: Invalidator<V>) => {
          const protectedRun: Subscriber<V> = (value) => {
            if (value === undefined) {
              if (args) {
                throw Error(`Subscription "${name}" with params ${JSON.stringify(args)} have undefined value.`)
              } else {
                throw Error(`Subscription "${name}" have undefined value.`)
              }
            }
            run(value)
          }

          const unsubscribe = derivedStore.subscribe(protectedRun, invalidate)

          const sub = runningSubs[subPath]
          if (sub) {
            sub.subscribersCount += 1
          }

          return () => {
            unsubscribe()
            cleanSubCache(subPath)
          }
        },
        getState: () => {
          const inputValues = Array.isArray(stores) ? stores.map((s) => s.getState()) : (stores as Subscription<any>).getState()
          return computationFn(inputValues, args)
        }
      }

      runningSubs[subPath] = { subscribersCount: 0, store: currentStore }
      runSubListeners('SUB_CREATED', subPath)

      return currentStore
    }
  }

  function regRootSub<V, Args extends any[]>(
    name: string,
    computationFn: (values: StoresValues<Subscription<T>>, args: Args) => V | undefined
  ): (...args: Args) => Subscription<V> {
    return regSub(name, () => root, computationFn)
  }

  function regMut<Params>(
    name: string,
    handler: (draft: Draft<T>, params?: Params) => void
  ): MutHandler<T> | MutHandlerWithParams<T, Params> {
    const mutate = (params?: Params, tx?: Transaction<T>): MutReturnValue => {
      if (tx) {
        const draft = tx.__draft
        handler(draft, params)
        return {name, params, isInsideTx: true}
      }

      update(draft => handler(draft, params))
      runMutListeners(name, params)

      return {name, params, isInsideTx: false}
    }

    if (handler.length === 2) {
      return (params: Params, tx?: Transaction<T>) => mutate(params, tx)
    }

    return (tx?: Transaction<T>) => mutate(undefined, tx)
  }

  function transaction(fn: (tx: Transaction<T>) => MutReturnValue[]) {
    let mutations: MutReturnValue[] = []

    store.update(state => {
      const draft = createDraft(state)
      const tx = { __draft: draft }

      mutations = fn(tx)
      return finishDraft(draft) as T
    })

    const mutWithoutTransaction = mutations.find((m) => !m.isInsideTx)
    if (mutWithoutTransaction) {
      throw Error(`Attempt to call mutation with name "${mutWithoutTransaction.name}" inside transaction without passing transaction object.`)
    }

    const name = 'tx: ' + mutations.map(({name}) => name).join(', ')
    runMutListeners(name, mutations)
  }

  function listenMuts(handler: MutListener): () => void {
    mutListeners.push(handler)
    return () => {
      const index = mutListeners.indexOf(handler)
      if (index !== -1) {
        mutListeners.splice(index, 1)
      }
    }
  }

  function runMutListeners(name: string, params: unknown) {
    mutListeners.forEach((listener => {
      listener(name, params)
    }))
  }

  function listenSubs(handler: SubListener): () => void {
    subListeners.push(handler)
    return () => {
      const index = subListeners.indexOf(handler)
      if (index !== -1) {
        subListeners.splice(index, 1)
      }
    }
  }

  function runSubListeners(action: SubListenerAction, name: string) {
    subListeners.forEach((listener => {
      listener(action, name)
    }))
  }

  function getRunningSubsState() {
    return Object.keys(runningSubs).reduce((data, name) => {
      const sub = runningSubs[name]
      if (sub) data[name] = sub.store.getState()
      return data
    }, {} as {[key: string]: any})
  }

  return { regSub, regRootSub, regMut, transaction, listenMuts, listenSubs, getRunningSubsState, root, set: store.set }
}

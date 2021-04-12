import type { Restate } from './index'

interface ReduxMessage {
  type: 'DISPATCH' | 'ACTION'
  payload: {
    type: 'JUMP_TO_ACTION' | 'JUMP_TO_STATE'
    name?: string
    args?: any[]
  }
  state?: string
}

// connect to redux devtools
interface WindowWithReduxDevtools {
  __REDUX_DEVTOOLS_EXTENSION__?: {
    connect: (options: object) => {
      init: (state: any) => void
      send: (action: any, state: any) => void
      subscribe: (callback: (message: ReduxMessage) => void) => void
    }
  }
}

export function connectToDevTools(store: Restate<any>, muts: {[key: string]: Function} = {}) {
  const windowObj = window as WindowWithReduxDevtools
  const devTools = windowObj.__REDUX_DEVTOOLS_EXTENSION__ && windowObj.__REDUX_DEVTOOLS_EXTENSION__.connect({
    name: document.title,
    actionCreators: muts
  })
  if (!devTools) {
    console.info("Could not connect to redux devtools")
    return
  }

  devTools.init(store.root.getState())

  devTools.subscribe((message) => {
    if (message.type === "DISPATCH" && (message.payload.type === "JUMP_TO_ACTION" || message.payload.type === "JUMP_TO_STATE") && message.state) {
      const state = JSON.parse(message.state)
      store.set(state)
    }

    if (message.type === "ACTION" && message.payload.name) {
      if (muts.hasOwnProperty(message.payload.name)) {
        const handler = (muts as {[key: string]: Function})[message.payload.name]
        handler.apply(null, message.payload.args)
      }
    }
  })

  // setup subscription store
  const devToolsSubs = windowObj.__REDUX_DEVTOOLS_EXTENSION__ && windowObj.__REDUX_DEVTOOLS_EXTENSION__.connect({
    name: `${document.title} | Subscriptions`
  })

  if (!devToolsSubs) {
    console.info("Could not connect to redux devtools")
    return
  }

  devToolsSubs.init(store.getRunningSubsState())

  store.listenSubs((action, name) => {
    devToolsSubs.send({type: action, payload: {name}}, store.getRunningSubsState())
  })

  store.listenMuts((name, params) => {
    devTools.send({type: name, payload: params}, store.root.getState())

    devToolsSubs.send({type: name, payload: params}, store.getRunningSubsState())
  })
}

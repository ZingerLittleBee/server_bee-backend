import { Dispatch } from "react"

export const kSetWs = "SET_WS"

export type WsState = {
  instance: WebSocket
}

export type WsAction = {
  type: string
  payload: WebSocket
}

export type WsContext = {
  ws: WsState
  wsDispatch: Dispatch<WsAction>
}

export const wsReducer = (state: WsState, action: WsAction): WsState => {
  switch (action.type) {
    case kSetWs:
      return {
        ...state,
        instance: action.payload,
      }
    default:
      return state
  }
}

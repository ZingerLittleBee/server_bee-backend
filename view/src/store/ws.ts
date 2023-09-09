import { Dispatch } from "react"

export const kSetWs = "SET_WS"
export const kSetWsStatus = "SET_WS_STATUS"

export type WsState = {
  instance: WebSocket
  status?: number
}

export type WsAction = WsInstanceAction | WsStatusAction

export type WsInstanceAction = {
  type: typeof kSetWs
  payload: WebSocket
}

export type WsStatusAction = {
    type: typeof kSetWsStatus
    payload: number
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
    case kSetWsStatus:
        return {
            ...state,
            status: action.payload,
        }
    default:
      return state
  }
}

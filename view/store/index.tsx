import React, { ReactNode, createContext, useContext, useReducer } from "react"
import { kCommunicationToken } from "@/const"
import { FusionContext, FusionState, fusionReducer } from "@/store/fusion"
import { HistoryContext, historyReducer } from "@/store/history"
import {
  SettingsContext,
  SettingsState,
  settingsReducer,
} from "@/store/settings"
import { TokenContext, tokenReducer } from "@/store/token"
import { WsContext, WsState, wsReducer } from "@/store/ws"

type StoreContextProps = FusionContext &
  TokenContext &
  HistoryContext &
  WsContext &
  SettingsContext

const StoreContext = createContext<StoreContextProps>({} as StoreContextProps)

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [fusion, fusionDispatch] = useReducer(fusionReducer, {} as FusionState)
  const [token, tokenDispatch] = useReducer(tokenReducer, {
    communicationToken: localStorage.getItem(kCommunicationToken) ?? "",
  })
  const [history, historyDispatch] = useReducer(historyReducer, {
    cpu: [],
    network: [],
  })
  const [settings, settingsDispatch] = useReducer(
    settingsReducer,
    {} as SettingsState
  )

  const [ws, wsDispatch] = useReducer(wsReducer, {} as WsState)

  return (
    <StoreContext.Provider
      value={{
        fusion,
        fusionDispatch,
        token,
        tokenDispatch,
        history,
        historyDispatch,
        ws,
        wsDispatch,
        settings,
        settingsDispatch,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext<StoreContextProps>(StoreContext)

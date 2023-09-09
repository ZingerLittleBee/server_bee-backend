import {ReactNode, createContext, useContext, useReducer, useEffect} from "react"
import { kCommunicationToken } from "@/const"
import {FusionContext, FusionState, fusionReducer, kSetFusion} from "@/store/fusion"
import {HistoryContext, historyReducer, kHistoryAdd} from "@/store/history"
import {
  SettingsContext,
  SettingsState,
  settingsReducer,
} from "@/store/settings"
import { TokenContext, tokenReducer } from "@/store/token"
import {WsContext, WsState, wsReducer, kSetWs, kSetWsStatus} from "@/store/ws"
import {Fusion} from "@/types/fusion.ts";

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

  useEffect(() => {
        if (token.communicationToken) {
            wsDispatch({type: kSetWsStatus, payload: WebSocket.CONNECTING})
            const loc = window.location
            let protocol = "ws://"
            if (loc.protocol === "https:") {
                protocol = "wss://"
            }
            const instance = new WebSocket(
                    `${protocol}${loc.host}/ws?token=${token.communicationToken}`
                )

            wsDispatch({ type: kSetWs, payload: instance })

            instance.onopen = () => {
                console.log("Websocket Connected")
                instance.send("/more")
                wsDispatch({type: kSetWsStatus, payload: WebSocket.OPEN})
            }
            instance.onmessage = (e) => {
                const fusion = JSON.parse(e.data) as Fusion
                fusionDispatch({ type: kSetFusion, payload: fusion })
                historyDispatch({ type: kHistoryAdd, payload: fusion.overview })
            }
            instance.onclose = () => {
                wsDispatch({type: kSetWsStatus, payload: WebSocket.CLOSED})
                console.log("Disconnected")
            }
            instance.onerror = (e) => {
                wsDispatch({type: kSetWsStatus, payload: WebSocket.CLOSED})
                console.log("Websocket Error", e)
            }
            return () => {
                console.log("Closing websocket")
                wsDispatch({type: kSetWsStatus, payload: WebSocket.CLOSING})
                instance.close();
            }
        }
    }, [token.communicationToken])

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

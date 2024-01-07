import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useReducer,
} from 'react'
import { kCommunicationToken, kTerminalSettings } from '@/const'
import {
    FusionContext,
    fusionReducer,
    FusionState,
    kSetFusion,
} from '@/store/fusion'
import { HistoryContext, historyReducer, kHistoryAdd } from '@/store/history'
import {
    SettingsContext,
    settingsReducer,
    SettingsState,
} from '@/store/settings'
import {
    defaultTerminalSettings,
    TerminalContext,
    terminalReducer,
} from '@/store/terminal.ts'
import { TokenContext, tokenReducer } from '@/store/token'
import { kSetWs, kSetWsStatus, WsContext, wsReducer, WsState } from '@/store/ws'

import { Fusion } from '@/types/fusion.ts'
import { TerminalSettings } from '@/types/settings.ts'
import { wsBaseUrl } from '@/lib/utils.ts'

type StoreContextProps = FusionContext &
    TokenContext &
    HistoryContext &
    WsContext &
    SettingsContext &
    TerminalContext

const StoreContext = createContext<StoreContextProps>({} as StoreContextProps)

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [fusion, fusionDispatch] = useReducer(
        fusionReducer,
        {} as FusionState
    )
    const [token, tokenDispatch] = useReducer(tokenReducer, {
        communicationToken: localStorage.getItem(kCommunicationToken) ?? '',
        isVerified: false,
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

    let terminalSettings: TerminalSettings | null = null
    try {
        const s = localStorage.getItem(kTerminalSettings)
        if (s) {
            terminalSettings = JSON.parse(s) as TerminalSettings
        }
    } catch {
        /* empty */
    }

    const [terminal, terminalDispatch] = useReducer(terminalReducer, {
        ...(terminalSettings ?? defaultTerminalSettings),
    })

    useEffect(() => {
        if (token.communicationToken) {
            wsDispatch({ type: kSetWsStatus, payload: WebSocket.CONNECTING })

            const instance = new WebSocket(
                `${wsBaseUrl()}/ws?token=${token.communicationToken}`
            )

            wsDispatch({ type: kSetWs, payload: instance })

            instance.onopen = () => {
                console.log('Websocket Connected')
                instance.send('/more')
                wsDispatch({ type: kSetWsStatus, payload: WebSocket.OPEN })
            }
            instance.onmessage = (e) => {
                const fusion = JSON.parse(e.data) as Fusion
                fusionDispatch({ type: kSetFusion, payload: fusion })
                historyDispatch({ type: kHistoryAdd, payload: fusion.overview })
            }
            instance.onclose = () => {
                wsDispatch({ type: kSetWsStatus, payload: WebSocket.CLOSED })
                console.log('Disconnected')
            }
            instance.onerror = (e) => {
                wsDispatch({ type: kSetWsStatus, payload: WebSocket.CLOSED })
                console.log('Websocket Error', e)
            }
            return () => {
                console.log('Closing websocket')
                wsDispatch({ type: kSetWsStatus, payload: WebSocket.CLOSING })
                instance.close()
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
                terminal,
                terminalDispatch,
            }}
        >
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext<StoreContextProps>(StoreContext)

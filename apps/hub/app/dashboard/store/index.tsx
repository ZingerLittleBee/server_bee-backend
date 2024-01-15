'use client'

import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    type ReactNode,
} from 'react'
import { type Fusion } from '@serverbee/types'

import {
    fusionReducer,
    kSetFusion,
    type FusionContext,
    type FusionState,
} from '@/app/dashboard/store/fusion'
import {
    kSetWs,
    kSetWsStatus,
    wsReducer,
    type WsContext,
    type WsState,
} from '@/app/dashboard/store/ws'

import { historyReducer, kHistoryAdd, type HistoryContext } from './history'

type StoreContextProps = FusionContext & HistoryContext & WsContext

const StoreContext = createContext<StoreContextProps>({} as StoreContextProps)

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [fusion, fusionDispatch] = useReducer(
        fusionReducer,
        {} as FusionState
    )
    const [history, historyDispatch] = useReducer(historyReducer, {
        cpu: [],
        network: [],
    })

    const [ws, wsDispatch] = useReducer(wsReducer, {} as WsState)

    useEffect(() => {
        if (fusion) {
            historyDispatch({ type: kHistoryAdd, payload: fusion.overview })
        }
    }, [fusion])

    useEffect(() => {
        if (
            ws.status !== WebSocket.OPEN &&
            ws.status !== WebSocket.CONNECTING &&
            ws.status !== WebSocket.CLOSING
        ) {
            wsDispatch({ type: kSetWsStatus, payload: WebSocket.CONNECTING })

            const instance = new WebSocket(`ws://localhost:5173/api/i/ws`)

            wsDispatch({ type: kSetWs, payload: instance })

            instance.onopen = () => {
                console.log('Websocket Connected')
                instance.send('/more')
                wsDispatch({ type: kSetWsStatus, payload: WebSocket.OPEN })
            }
            instance.onmessage = (e) => {
                try {
                    const fusion = JSON.parse(e.data) as Fusion
                    fusionDispatch({ type: kSetFusion, payload: fusion })
                    historyDispatch({
                        type: kHistoryAdd,
                        payload: fusion.overview,
                    })
                } catch {}
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
                wsDispatch({
                    type: kSetWs,
                    payload: {} as WebSocket,
                })
                instance.close()
            }
        }
    }, [])

    return (
        <StoreContext.Provider
            value={{
                fusion,
                fusionDispatch,
                history,
                historyDispatch,
                ws,
                wsDispatch,
            }}
        >
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext<StoreContextProps>(StoreContext)

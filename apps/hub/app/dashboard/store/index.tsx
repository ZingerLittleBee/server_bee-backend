'use client'

import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    type ReactNode,
} from 'react'
import { OVERVIEW_CMD } from '@/constant/ws'
import { useBoundStore } from '@/store'
import { type Record } from '@serverbee/types'

import {
    fusionReducer,
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
    const updateRecord = useBoundStore.use.updateRecord()
    const addNetworkHistory = useBoundStore.use.addNetworkHistory()

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
                instance.send(OVERVIEW_CMD)
                wsDispatch({ type: kSetWsStatus, payload: WebSocket.OPEN })
            }
            instance.onmessage = (e) => {
                try {
                    const records = JSON.parse(e.data) as Record | Record[]
                    const recordArray = Array.isArray(records)
                        ? records
                        : [records]
                    updateRecord(recordArray)
                    // update cpu activity and network activity
                    if (recordArray.length === 1) {
                        const record = recordArray[0]
                        if (record?.fusion?.overview) {
                            historyDispatch({
                                type: kHistoryAdd,
                                payload: {
                                    ...record.fusion.overview,
                                    time: record.time,
                                },
                            })
                        }
                    }
                    if (Array.isArray(records)) {
                        addNetworkHistory(
                            records?.map((r) => ({
                                serverId: r.server_id,
                                network: r.fusion.overview.network_io,
                            }))
                        )
                    }
                } catch (e) {
                    console.error('Error parsing websocket message', e)
                }
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

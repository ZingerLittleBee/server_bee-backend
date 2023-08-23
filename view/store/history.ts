import {Overview} from "@/types/fusion";
import {Dispatch} from "react";
import {toKiB, toMiB} from "@/lib/utils";

export const kHistoryAdd = 'HISTORY_ADD'

export type HistoryState = {
    cpu: { value: string, time: number }[]
    // unit: MiB
    network: { tx: string, rx: string, time: number }[]
}

export interface HistoryAction {
    type: typeof kHistoryAdd
    payload: Overview
}

export interface HistoryContext {
    history: HistoryState,
    historyDispatch: Dispatch<HistoryAction>
}

export const historyReducer = (state: HistoryState, action: HistoryAction): HistoryState => {
    switch (action.type) {
        case kHistoryAdd:
            const time = Math.floor(Date.now() / 1000)
            return {
                ...state,
                cpu: [...(state.cpu?.length > 1000 ? state.cpu.slice(-1000) : state.cpu), {
                    value: action.payload.cpu_usage,
                    time: time
                }],
                network: [...state.network, {
                    tx: toKiB(action.payload.network_io.tx).toFixed(1),
                    rx: toKiB(action.payload.network_io.rx).toFixed(1),
                    time: time
                }]
            }
        default:
            return state
    }
}

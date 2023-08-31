import React, {createContext, ReactNode, useContext, useReducer} from "react";
import {FusionContext, fusionReducer, FusionState} from "@/store/fusion";
import {TokenContext, tokenReducer} from "@/store/token";
import {HistoryContext, historyReducer, HistoryState} from "@/store/history";
import {WsContext, wsReducer, WsState} from "@/store/ws";
import {kCommunicationToken} from "@/const";

type StoreContextProps = FusionContext & TokenContext & HistoryContext & WsContext


const StoreContext = createContext<StoreContextProps>({} as StoreContextProps);

export const StoreProvider = ({children}: {
    children: ReactNode
}) => {
    const [fusion, fusionDispatch] = useReducer(fusionReducer, {} as FusionState)
    const [token, tokenDispatch] = useReducer(tokenReducer, {
        communicationToken: localStorage.getItem(kCommunicationToken) ?? '',
    })
    const [history, historyDispatch] = useReducer(historyReducer, {
        cpu: [],
        network: [],
    })

    const [ws, wsDispatch] = useReducer(wsReducer, {} as WsState)

    return (
        <StoreContext.Provider value={{
            fusion, fusionDispatch,
            token, tokenDispatch,
            history, historyDispatch,
            ws, wsDispatch
        }}>
            {children}
        </StoreContext.Provider>
    );
};


export const useStore = () => useContext<StoreContextProps>(StoreContext)

import React, {createContext, ReactNode, useContext, useReducer} from "react";
import {FusionContext, fusionReducer, FusionState} from "@/store/fusion";
import {TokenContext, tokenReducer} from "@/store/token";
import {HistoryContext, historyReducer, HistoryState} from "@/store/history";

type StoreContextProps = FusionContext & TokenContext & HistoryContext


const StoreContext = createContext<StoreContextProps>({} as StoreContextProps);

export const StoreProvider = ({children}: {
    children: ReactNode
}) => {
    const [fusion, fusionDispatch] = useReducer(fusionReducer, {} as FusionState)
    const [token, tokenDispatch] = useReducer(tokenReducer, {
        communicationToken: "",
    })
    const [history, historyDispatch] = useReducer(historyReducer, {
        cpu: [],
        network: [],
    })

    return (
        <StoreContext.Provider value={{
            fusion, fusionDispatch,
            token, tokenDispatch,
            history, historyDispatch
        }}>
            {children}
        </StoreContext.Provider>
    );
};


export const useStore = () => useContext<StoreContextProps>(StoreContext)

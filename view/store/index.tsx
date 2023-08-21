import React, {createContext, ReactNode, useContext, useReducer} from "react";
import {FusionContext, fusionReducer} from "@/store/fusion";
import {TokenContext, tokenReducer} from "@/store/token";

type StoreContextProps = FusionContext & TokenContext


const StoreContext = createContext<StoreContextProps>({} as StoreContextProps);

export const StoreProvider = ({children}: {
    children: ReactNode
}) => {
    const [fusion, fusionDispatch] = useReducer(fusionReducer, {})
    const [token, tokenDispatch] = useReducer(tokenReducer, {})

    return (
        <StoreContext.Provider value={{
            fusion, fusionDispatch,
            token, tokenDispatch
        }}>
            {children}
        </StoreContext.Provider>
    );
};


export const useStore = () => useContext<StoreContextProps>(StoreContext)

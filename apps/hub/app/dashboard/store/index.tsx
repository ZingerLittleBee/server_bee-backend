import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useReducer,
} from 'react'
import { Fusion } from '@serverbee/types'

import { HistoryContext, historyReducer, kHistoryAdd } from './history'

type StoreContextProps = {
    fusion?: Fusion
} & HistoryContext

const StoreContext = createContext<StoreContextProps>({} as StoreContextProps)

export const StoreProvider = ({
    fusion,
    children,
}: {
    children: ReactNode
    fusion?: Fusion
}) => {
    const [history, historyDispatch] = useReducer(historyReducer, {
        cpu: [],
        network: [],
    })

    useEffect(() => {
        if (fusion) {
            historyDispatch({ type: kHistoryAdd, payload: fusion.overview })
        }
    }, [fusion])

    return (
        <StoreContext.Provider
            value={{
                fusion,
                history,
                historyDispatch,
            }}
        >
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext<StoreContextProps>(StoreContext)

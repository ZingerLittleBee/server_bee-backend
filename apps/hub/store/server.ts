import { type ImmerStateCreator } from '@/store/index'

type State = {
    currentServerId: string
}

type Action = {
    setCurrentServerId: (id: string) => void
}

export type ServerSlice = State & Action

export const creatServerSlice: ImmerStateCreator<ServerSlice> = (set) => ({
    currentServerId: '',
    setCurrentServerId: (id) =>
        set((state) => {
            state.currentServerId = id
        }),
})

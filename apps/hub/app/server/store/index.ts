import { type StateCreator } from 'zustand'

export enum ServerTabEnum {
    Server = 'Server',
    Group = 'Group',
}

type State = {
    currentTab: ServerTabEnum
}

type Action = {
    setCurrentTab: (currentTab: State['currentTab']) => void
}

export type ServerPageSlice = State & Action

export const createServerPageSlice: StateCreator<
    ServerPageSlice,
    [],
    [],
    ServerPageSlice
> = (set) => ({
    currentTab: ServerTabEnum.Server,
    setCurrentTab: (currentTab) => set(() => ({ currentTab })),
})

import { PanelFilter } from '@/constant/enum/filter'
import { type StateCreator } from 'zustand'

type State = {
    panelFilter: PanelFilter
}

type Action = {
    setPanelFilter: (filter: State['panelFilter']) => void
}

export type PanelFilterSlice = State & Action

export const createPanelFilterSlice: StateCreator<
    PanelFilterSlice,
    [],
    [],
    PanelFilterSlice
> = (set) => ({
    panelFilter: PanelFilter.All,
    setPanelFilter: (panelFilter) => set(() => ({ panelFilter })),
})

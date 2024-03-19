'use client'

import { createSelectors } from '@/store/createSelectors'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
    createPanelFilterSlice,
    type PanelFilterSlice,
} from '@/app/panel/components/filter/store'

type PersistStore = PanelFilterSlice

const usePersistStoreBase = create<PersistStore>()(
    persist(
        (...a) => ({
            ...createPanelFilterSlice(...a),
        }),
        {
            name: 'panel-filter',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export const usePersistStore = createSelectors(usePersistStoreBase)

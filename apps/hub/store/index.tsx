'use client'

import { createSelectors } from '@/store/createSelectors'
import {
    createNetworkHistorySlice,
    type NetworkHistorySlice,
} from '@/store/networkHistory'
import { createRecordSlice, type RecordSlice } from '@/store/record'
import { creatServerSlice, ServerSlice } from '@/store/server'
import { create, type StateCreator } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import {
    createServerFormDialogSlice,
    type ServerFormDialogSlice,
} from '@/app/server/store/form-dialog'
import {
    createTokenDialogSlice,
    type TokenDialogSlice,
} from '@/app/server/store/token-dialog'

export type ImmerStateCreator<T> = StateCreator<
    T,
    [['zustand/immer', never], never],
    [],
    T
>

type BoundStore = ServerFormDialogSlice &
    TokenDialogSlice &
    RecordSlice &
    NetworkHistorySlice &
    ServerSlice

const useBoundStoreBase = create<BoundStore>()(
    immer((...a) => ({
        ...createServerFormDialogSlice(...a),
        ...createTokenDialogSlice(...a),
        ...createRecordSlice(...a),
        ...createNetworkHistorySlice(...a),
        ...creatServerSlice(...a),
    }))
)

export const useBoundStore = createSelectors(useBoundStoreBase)

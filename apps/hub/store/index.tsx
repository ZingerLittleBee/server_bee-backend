'use client'

import { createSelectors } from '@/store/createSelectors'
import {
    createNetworkHistorySlice,
    type NetworkHistorySlice,
} from '@/store/networkHistory'
import { createRecordSlice, type RecordSlice } from '@/store/record'
import { creatServerSlice, type ServerSlice } from '@/store/server'
import { create, type StateCreator } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { createServerPageSlice, type ServerPageSlice } from '@/app/server/store'
import {
    createConfirmDialogSlice,
    type ConfirmDialogSlice,
} from '@/app/server/store/confirm-dialog'
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

type BoundStore = ServerPageSlice &
    ServerFormDialogSlice &
    TokenDialogSlice &
    RecordSlice &
    NetworkHistorySlice &
    ServerSlice &
    ConfirmDialogSlice

export const useBoundStoreBase = create<BoundStore>()(
    immer((...a) => ({
        ...createServerPageSlice(...a),
        ...createServerFormDialogSlice(...a),
        ...createTokenDialogSlice(...a),
        ...createRecordSlice(...a),
        ...createNetworkHistorySlice(...a),
        ...creatServerSlice(...a),
        ...createConfirmDialogSlice(...a),
    }))
)

export const useBoundStore = createSelectors(useBoundStoreBase)

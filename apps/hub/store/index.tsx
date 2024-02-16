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

import {
    createPanelFilterSlice,
    type PanelFilterSlice,
} from '@/app/panel/components/filter/store'
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

type BoundStore = ServerFormDialogSlice &
    TokenDialogSlice &
    RecordSlice &
    NetworkHistorySlice &
    ServerSlice &
    ConfirmDialogSlice &
    PanelFilterSlice

const useBoundStoreBase = create<BoundStore>()(
    immer((...a) => ({
        ...createServerFormDialogSlice(...a),
        ...createTokenDialogSlice(...a),
        ...createRecordSlice(...a),
        ...createNetworkHistorySlice(...a),
        ...creatServerSlice(...a),
        ...createConfirmDialogSlice(...a),
        ...createPanelFilterSlice(...a),
    }))
)

export const useBoundStore = createSelectors(useBoundStoreBase)

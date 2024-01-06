import { createSelectors } from '@/store/createSelectors'
import { create } from 'zustand'

import {
    createServerFormDialogSlice,
    type ServerFormDialogSlice,
} from '@/app/server/store/form-dialog'
import {
    createTokenDialogSlice,
    type TokenDialogSlice,
} from '@/app/server/store/token-dialog'

type BoundStore = ServerFormDialogSlice & TokenDialogSlice

const useBoundStoreBase = create<BoundStore>((...a) => ({
    ...createServerFormDialogSlice(...a),
    ...createTokenDialogSlice(...a),
}))

export const useBoundStore = createSelectors(useBoundStoreBase)

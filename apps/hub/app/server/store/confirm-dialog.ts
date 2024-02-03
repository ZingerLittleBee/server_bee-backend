import { type StateCreator } from 'zustand'

import { type ConfirmDialogProps } from '@/app/server/components/table/confirm-dialog'

type State = {
    isOpenConfirmDialog: boolean
    confirmDialogProps: ConfirmDialogProps
}

type Action = {
    setIsOpenConfirmDialog: (isOpen: State['isOpenConfirmDialog']) => void
    setConfirmDialogProps: (
        confirmDialogProps: State['confirmDialogProps']
    ) => void
}

export type ConfirmDialogSlice = State & Action

export const createConfirmDialogSlice: StateCreator<
    ConfirmDialogSlice,
    [],
    [],
    ConfirmDialogSlice
> = (set) => ({
    isOpenConfirmDialog: false,
    confirmDialogProps: {
        title: 'Are you absolutely sure?',
        description: 'You will not be able to undo this action.',
    },
    setIsOpenConfirmDialog: (isOpen: boolean) =>
        set(() => ({ isOpenConfirmDialog: isOpen })),
    setConfirmDialogProps: (confirmDialogProps: ConfirmDialogProps) =>
        set((state) => ({
            confirmDialogProps: {
                ...state.confirmDialogProps,
                ...confirmDialogProps,
            },
        })),
})

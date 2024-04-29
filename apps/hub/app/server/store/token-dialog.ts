import { type StateCreator } from 'zustand'

import { type TokenDialogProps } from '@/app/server/components/token-dialog'

type State = {
    isOpenTokenDialog: boolean
    tokenDialogProps: TokenDialogProps
}

type Action = {
    setIsOpenTokenDialog: (isOpen: State['isOpenTokenDialog']) => void
    setTokenDialogProps: (tokenDialogProps: State['tokenDialogProps']) => void
}

export type TokenDialogSlice = State & Action

export const createTokenDialogSlice: StateCreator<
    TokenDialogSlice,
    [],
    [],
    TokenDialogSlice
> = (set) => ({
    tokenDialogProps: {
        title: '',
        serverId: '',
    },
    isOpenTokenDialog: false,
    setTokenDialogProps: (tokenDialogProps) =>
        set(() => ({ tokenDialogProps: tokenDialogProps })),
    setIsOpenTokenDialog: (isOpen) =>
        set(() => ({ isOpenTokenDialog: isOpen })),
})

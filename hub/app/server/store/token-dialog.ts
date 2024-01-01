import { create } from 'zustand'

import { type TokenDialogProps } from '@/app/server/components/token-dialog'

type State = {
    isOpen: boolean
    tokenDialogProps: TokenDialogProps
}

type Action = {
    setIsOpen: (isOpen: State['isOpen']) => void
    setTokenDialogProps: (tokenDialogProps: State['tokenDialogProps']) => void
}

// Create your store, which includes both state and (optionally) actions
export const useTokenDialogStore = create<State & Action>((set) => ({
    tokenDialogProps: {
        title: '',
        tokens: [],
    },
    isOpen: false,
    setTokenDialogProps: (tokenDialogProps) =>
        set(() => ({ tokenDialogProps: tokenDialogProps })),
    setIsOpen: (isOpen) => set(() => ({ isOpen: isOpen })),
}))

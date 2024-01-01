import { create } from 'zustand'

import {
    ServerFormMode,
    type ServerFormProps,
} from '@/app/server/components/server-form'

type State = {
    isOpen: boolean
    serverFormProps: ServerFormProps
}

type Action = {
    setIsOpen: (isOpen: State['isOpen']) => void
    setServerFormProps: (serverFormProps: State['serverFormProps']) => void
}

// Create your store, which includes both state and (optionally) actions
export const useFormDialogStore = create<State & Action>((set) => ({
    isOpen: false,
    serverFormProps: {
        mode: ServerFormMode.Create,
    },
    setServerFormProps: (serverFormProps) =>
        set(() => ({ serverFormProps: serverFormProps })),
    setIsOpen: (isOpen) => set(() => ({ isOpen: isOpen })),
}))

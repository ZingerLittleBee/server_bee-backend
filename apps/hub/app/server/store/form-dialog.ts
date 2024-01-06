import { type StateCreator } from 'zustand'

import {
    ServerFormMode,
    type ServerFormProps,
} from '@/app/server/components/server-form'

type State = {
    isOpenServerForm: boolean
    serverFormProps: ServerFormProps
}

type Action = {
    setIsOpenServerForm: (isOpen: State['isOpenServerForm']) => void
    setServerFormProps: (serverFormProps: State['serverFormProps']) => void
}

export type ServerFormDialogSlice = State & Action

export const createServerFormDialogSlice: StateCreator<
    ServerFormDialogSlice,
    [],
    [],
    ServerFormDialogSlice
> = (set) => ({
    isOpenServerForm: false,
    serverFormProps: {
        mode: ServerFormMode.Create,
    },
    setServerFormProps: (serverFormProps: ServerFormProps) =>
        set(() => ({ serverFormProps: serverFormProps })),
    setIsOpenServerForm: (isOpen: boolean) =>
        set(() => ({ isOpenServerForm: isOpen })),
})

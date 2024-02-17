import { FormMode } from '@/constant/enum/mode'
import { type StateCreator } from 'zustand'

import { type GroupFormProps } from '@/app/server/components/form/group-form'
import { type ServerFormProps } from '@/app/server/components/form/server-form'

type State = {
    isOpenServerForm: boolean
    serverFormProps: ServerFormProps
    groupFormProps: GroupFormProps
}

type Action = {
    setIsOpenServerForm: (isOpen: State['isOpenServerForm']) => void
    setServerFormProps: (serverFormProps: State['serverFormProps']) => void
    setGroupFormProps: (groupFormProps: State['groupFormProps']) => void
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
        mode: FormMode.Create,
    },
    groupFormProps: {
        mode: FormMode.Create,
    },
    setServerFormProps: (serverFormProps: ServerFormProps) =>
        set(() => ({ serverFormProps: serverFormProps })),
    setIsOpenServerForm: (isOpen: boolean) =>
        set(() => ({ isOpenServerForm: isOpen })),
    setGroupFormProps: (groupFormProps: GroupFormProps) =>
        set(() => ({ groupFormProps: groupFormProps })),
})

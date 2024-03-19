'use client'

import * as React from 'react'
import { useMemo } from 'react'
import { FormMode } from '@/constant/enum/mode'
import { useBoundStore } from '@/store'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { GroupForm } from '@/app/server/components/form/group-form'
import { ServerForm } from '@/app/server/components/form/server-form'
import { ServerTabEnum } from '@/app/server/store'

export default function FormDialog() {
    const isOpen = useBoundStore.use.isOpenServerForm()
    const setIsOpen = useBoundStore.use.setIsOpenServerForm()
    const serverFormProps = useBoundStore.use.serverFormProps()
    const groupFormProps = useBoundStore.use.groupFormProps()
    const currentTab = useBoundStore.use.currentTab()

    const title = useMemo(() => {
        if (currentTab === ServerTabEnum.Server) {
            return serverFormProps.mode === FormMode.Create
                ? 'Add Server'
                : 'Edit Server'
        } else {
            return groupFormProps.mode === FormMode.Create
                ? 'Add Group'
                : 'Edit Group'
        }
    }, [currentTab, groupFormProps.mode, serverFormProps.mode])

    return (
        <Dialog defaultOpen={isOpen} open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when
                        you're done.
                    </DialogDescription>
                </DialogHeader>
                {currentTab === ServerTabEnum.Server ? (
                    <ServerForm {...serverFormProps} />
                ) : (
                    <GroupForm {...groupFormProps} />
                )}
            </DialogContent>
        </Dialog>
    )
}

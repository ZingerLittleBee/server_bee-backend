'use client'

import * as React from 'react'
import { useBoundStore } from '@/store'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    ServerForm,
    ServerFormMode,
} from '@/app/server/components/form/server-form'

export default function FormDialog() {
    const isOpen = useBoundStore.use.isOpenServerForm()
    const setIsOpen = useBoundStore.use.setIsOpenServerForm()
    const serverFormProps = useBoundStore.use.serverFormProps()

    return (
        <Dialog defaultOpen={isOpen} open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {serverFormProps.mode === ServerFormMode.Create
                            ? 'Add Server'
                            : 'Edit Server'}
                    </DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when
                        you're done.
                    </DialogDescription>
                </DialogHeader>
                <ServerForm {...serverFormProps} />
            </DialogContent>
        </Dialog>
    )
}
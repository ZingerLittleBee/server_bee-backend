'use client'

import * as React from 'react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { ServerForm, ServerFormMode } from '@/app/server/components/server-form'
import { useFormDialogStore } from '@/app/server/store/form-dialog'

export default function FormDialog() {
    const { isOpen, setIsOpen, serverFormProps } = useFormDialogStore()

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

'use client'

import * as React from 'react'
import { useBoundStore } from '@/store'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type ConfirmDialogProps = {
    title?: string
    description?: string
    onConfirm?: () => void
    onCancel?: () => void
}

export default function ConfirmDialog() {
    const isOpen = useBoundStore.use.isOpenConfirmDialog()
    const setIsOpen = useBoundStore.use.setIsOpenConfirmDialog()
    const confirmDialogProps = useBoundStore.use.confirmDialogProps()

    return (
        <AlertDialog
            defaultOpen={isOpen}
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {confirmDialogProps.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {confirmDialogProps.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={confirmDialogProps.onCancel}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDialogProps.onConfirm}>
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

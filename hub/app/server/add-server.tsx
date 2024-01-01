'use client'

import * as React from 'react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ServerFormMode } from '@/app/server/components/server-form'
import { useFormDialogStore } from '@/app/server/store/form-dialog'

export default function AddServer() {
    const { setIsOpen, setServerFormProps } = useFormDialogStore()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => {
                setServerFormProps({
                    mode: ServerFormMode.Create,
                    onSubmit: () => setIsOpen(false),
                })
                setIsOpen(true)
            }}
        >
            <PlusCircle />
        </Button>
    )
}

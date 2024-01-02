'use client'

import * as React from 'react'
import { useBoundStore } from '@/store'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ServerFormMode } from '@/app/server/components/server-form'

export default function AddServer() {
    const setIsOpen = useBoundStore.use.setIsOpenServerForm()
    const setServerFormProps = useBoundStore.use.setServerFormProps()

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

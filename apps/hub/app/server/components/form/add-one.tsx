'use client'

import * as React from 'react'
import { useCallback } from 'react'
import { FormMode } from '@/constant/enum/mode'
import { useBoundStore } from '@/store'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ServerTabEnum } from '@/app/server/store'

export default function AddOne() {
    const setIsOpen = useBoundStore.use.setIsOpenServerForm()
    const setServerFormProps = useBoundStore.use.setServerFormProps()
    const setGroupFormProps = useBoundStore.use.setGroupFormProps()
    const currentTab = useBoundStore.use.currentTab()

    const addServer = useCallback(() => {
        setServerFormProps({
            mode: FormMode.Create,
            onSubmit: () => setIsOpen(false),
        })
        setIsOpen(true)
    }, [setIsOpen, setServerFormProps])

    const addGroup = useCallback(() => {
        setGroupFormProps({
            mode: FormMode.Create,
            onSubmit: () => setIsOpen(false),
        })
        setIsOpen(true)
    }, [setGroupFormProps, setIsOpen])

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={currentTab === ServerTabEnum.Server ? addServer : addGroup}
        >
            <PlusCircle />
        </Button>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useBoundStore } from '@/store'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import useServerList from '@/hooks/useServerList'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

const enablePathname = ['/dashboard']

export default function ServerSelect() {
    const pathname = usePathname()

    if (enablePathname.includes(pathname)) {
        return <_ServerSelect />
    }

    return null
}

function _ServerSelect() {
    const serverList = useServerList()

    const currentServerId = useBoundStore.use.currentServerId()
    const setCurrentServerId = useBoundStore.use.setCurrentServerId()

    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!currentServerId && serverList[0]?.id) {
            setCurrentServerId(serverList[0].id)
        }
    }, [currentServerId, serverList, setCurrentServerId])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {currentServerId
                        ? serverList.find((s) => s.id === currentServerId)?.name
                        : 'Select server...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        className="border-none focus:border-none focus:outline-none focus:ring-0"
                        placeholder="Search server..."
                    />
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                        {serverList.map((s) => (
                            <CommandItem
                                key={s.id}
                                value={s.id}
                                onSelect={(currentValue) => {
                                    setCurrentServerId(currentValue)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        currentServerId === s.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {s.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

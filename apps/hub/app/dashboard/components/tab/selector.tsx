import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
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
import { ScrollArea } from '@/components/ui/scroll-area'

export type SelectorProp = {
    subject: string
    groups: { value: string; label: string }[]
    value: string
    setValue: (value: string) => void
}

export default function Selector({
    subject,
    groups = [],
    value,
    setValue,
}: SelectorProp) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between sm:w-[300px]"
                >
                    {value
                        ? groups.find((group) => group.value === value)?.label
                        : `Select ${subject}...`}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-4rem)]  p-0 sm:w-[300px]">
                <Command>
                    <CommandInput placeholder={`Search ${subject}...`} />
                    <CommandEmpty>No ${subject} found.</CommandEmpty>
                    <CommandGroup>
                        <ScrollArea viewportClassName="max-h-72">
                            {groups.map((group) => (
                                <CommandItem
                                    key={group.value}
                                    value={group.value}
                                    onSelect={(currentValue) => {
                                        setValue(
                                            currentValue === value
                                                ? ''
                                                : currentValue
                                        )
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === group.value
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                    {group.label}
                                </CommandItem>
                            ))}
                        </ScrollArea>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

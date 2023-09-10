import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command.tsx'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover.tsx'

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
                    className="w-[300px] justify-between"
                >
                    {value
                        ? groups.find((group) => group.value === value)?.label
                        : `Select ${subject}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder={`Search ${subject}...`} />
                    <CommandEmpty>No ${subject} found.</CommandEmpty>
                    <CommandGroup>
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
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

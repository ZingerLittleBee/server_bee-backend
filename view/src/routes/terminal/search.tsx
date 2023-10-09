import { ChangeEvent, useEffect, useState } from 'react'

import { CommandDialog, CommandInput } from '@/components/ui/command.tsx'

interface SearchWidgetProps {
    onSearch: (value: string) => void
}

export default function SearchWidget({ onSearch }: SearchWidgetProps) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('')

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    return (
        <>
            <p className="text-sm text-muted-foreground">
                Press{' '}
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>J
                </kbd>{' '}
                to search.
            </p>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearch(value)
                            setOpen(false)
                        }
                    }}
                    value={value}
                    onInput={(e: ChangeEvent<HTMLInputElement>) =>
                        setValue(e.target.value)
                    }
                    placeholder="Type content to search..."
                />
            </CommandDialog>
        </>
    )
}

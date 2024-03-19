import { HTMLAttributes } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface SidebarNavProps extends HTMLAttributes<HTMLElement> {
    items: {
        href: string
        title: string
        disabled?: boolean
    }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = useLocation().pathname

    return (
        <nav
            className={cn(
                'sticky top-20 flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    draggable="false"
                    key={item.href}
                    to={item.disabled ? '' : item.href}
                    className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        pathname === item.href
                            ? 'bg-muted hover:bg-muted'
                            : 'hover:bg-transparent hover:underline',
                        'justify-start',
                        item.disabled ? 'cursor-not-allowed opacity-50' : ''
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}

import { Link } from 'react-router-dom'

import { NavItem } from '@/types/nav'
import { siteConfig } from '@/config/site'
import { kDashboardRoute } from '@/lib/route.ts'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'

interface MainNavProps {
    items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
    return (
        <div className="flex gap-6 md:gap-10">
            <Link
                to={kDashboardRoute}
                draggable="false"
                className="flex items-center space-x-2"
            >
                <Icons.logo className="h-6 w-6" />
                <span className="inline-block font-bold">
                    {siteConfig.name}
                </span>
            </Link>
            {items?.length ? (
                <nav className="flex gap-6">
                    {items
                        ?.filter((i) => i.hide !== true)
                        .map(
                            (item, index) =>
                                item.href && (
                                    <Link
                                        draggable="false"
                                        key={index}
                                        to={item.href}
                                        className={cn(
                                            'flex items-center text-sm font-medium text-muted-foreground',
                                            item.disabled &&
                                                'cursor-not-allowed opacity-80',
                                            item.cls
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                )
                        )}
                </nav>
            ) : null}
        </div>
    )
}

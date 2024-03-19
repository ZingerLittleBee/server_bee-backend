import { Italic } from '@tremor/react'
import { Outlet } from 'react-router-dom'

import { Separator } from '@/components/ui/separator'

import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
    {
        title: 'General',
        href: '/settings/general',
    },
    {
        title: 'Security',
        href: '/settings/security',
    },
    {
        title: 'Server',
        href: '/settings/server',
    },
    {
        title: 'Terminal',
        href: '/settings/terminal',
    },
    // {
    //     title: 'Appearance',
    //     href: '/settings/appearance',
    //     disabled: true,
    // },
]

export default function SettingsLayout() {
    return (
        <section className="grid items-center gap-6 pb-8">
            <div className="space-y-6 py-5 pb-16">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Settings
                    </h2>
                    <p className="text-muted-foreground">
                        Manage your <Italic> ServerBee Backend</Italic> settings
                        and set preferences.
                    </p>
                </div>
                <Separator className="my-6" />
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="-mx-4 lg:w-1/5">
                        <SidebarNav items={sidebarNavItems} />
                    </aside>
                    <div className="flex-1 lg:max-w-2xl">
                        <Outlet />
                    </div>
                </div>
            </div>
        </section>
    )
}

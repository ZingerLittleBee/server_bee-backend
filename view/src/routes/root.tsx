import { Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'
import { SiteHeader } from '@/components/site-header'
import { TailwindIndicator } from '@/components/tailwind-indicator'

export default function Root() {
    return (
        <>
            <div className="relative flex h-full min-h-screen flex-col">
                <SiteHeader />
                <div className="container h-full items-center py-4">
                    <Outlet />
                </div>
                <Toaster />
            </div>
            <TailwindIndicator />
        </>
    )
}
// h-[calc(100vh-65px)]

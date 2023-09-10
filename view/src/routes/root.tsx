import { Outlet } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'
import { SiteHeader } from '@/components/site-header'
import { TailwindIndicator } from '@/components/tailwind-indicator'

export default function Root() {
    return (
        <>
            <div className="relative flex h-full min-h-screen flex-col">
                <SiteHeader />
                <div className="container h-[calc(100vh-65px)] items-center space-x-4 pt-4 sm:justify-between sm:space-x-0">
                    <Outlet />
                </div>
                <Toaster />
            </div>
            <TailwindIndicator />
        </>
    )
}

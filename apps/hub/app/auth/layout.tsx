import { type ReactNode } from 'react'
import { type Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Dashboard page.',
}

interface DashboardLayoutProps {
    children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <section className="container relative grid h-[calc(100vh-65px)] items-center">
            {children}
        </section>
    )
}

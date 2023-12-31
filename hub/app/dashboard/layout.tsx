import { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Dashboard page.',
}

interface DashboardLayoutProps {
    children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <section className="container relative grid items-center gap-6">
            {children}
        </section>
    )
}

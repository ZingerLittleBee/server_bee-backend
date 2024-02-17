import { type ReactNode } from 'react'
import { type Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Panel',
    description: 'Server Panel.',
}

interface PanelLayoutProps {
    children: ReactNode
}

export default function PanelLayout({ children }: PanelLayoutProps) {
    return (
        <section className="container relative grid items-center px-0">
            {children}
        </section>
    )
}

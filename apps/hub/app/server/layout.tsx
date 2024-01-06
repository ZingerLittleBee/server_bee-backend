import { type ReactNode } from 'react'
import { type Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Server',
    description: 'Server page.',
}

interface ServerLayoutProps {
    children: ReactNode
}

export default function ServerLayout({ children }: ServerLayoutProps) {
    return (
        <section className="container relative grid items-center gap-6">
            {children}
        </section>
    )
}

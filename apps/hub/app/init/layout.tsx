import { type ReactNode } from 'react'
import { type Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Init Database',
    description: 'Init Database.',
}

interface InitLayoutProps {
    children: ReactNode
}

export default function InitLayout({ children }: InitLayoutProps) {
    return (
        <section
            className="container
        relative m-auto grid size-full h-[calc(100vh-80px)] items-center justify-center"
        >
            {children}
        </section>
    )
}

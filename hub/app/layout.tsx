import '@/styles/globals.css'

import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { TRPCReactProvider } from '@/trpc/react'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
})

export const metadata = {
    title: 'ServerBee Hub',
    description: 'ServerBee Hub',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className={`font-sans ${inter.variable}`}>
                <TRPCReactProvider cookies={cookies().toString()}>
                    {children}
                </TRPCReactProvider>
            </body>
        </html>
    )
}

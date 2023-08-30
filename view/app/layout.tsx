"use client"

import {ReactNode} from 'react'
import './globals.css'
import {Inter} from 'next/font/google'
import {SiteHeader} from "@/components/site-header";
import {ThemeProvider} from "@/components/theme-provider";
import {Toaster} from "@/components/ui/toaster";
import {TailwindIndicator} from "@/components/tailwind-indicator";
import {StoreProvider} from "@/store";

const inter = Inter({subsets: ['latin']})

export default function RootLayout({children}: { children: ReactNode }) {

    return (
        <html lang="en">
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="h-full relative flex min-h-screen flex-col">
                <SiteHeader/>
                <div className="container h-full items-center space-x-4 sm:justify-between sm:space-x-0 pt-4">
                    <StoreProvider>
                        {children}
                    </StoreProvider>
                </div>
                <Toaster/>
            </div>
            <TailwindIndicator/>
        </ThemeProvider>
        </body>
        </html>
    )
}

import React from 'react'
import { StoreProvider } from '@/store/index.tsx'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from '@/components/theme-provider.tsx'

import './globals.css'

import router from '@/routes/router.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <StoreProvider>
                <RouterProvider router={router} />
            </StoreProvider>
        </ThemeProvider>
    </React.StrictMode>
)

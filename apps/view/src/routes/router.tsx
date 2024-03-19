import { createRef } from 'react'
import ErrorPage from '@/error-page.tsx'
import DashboardPage from '@/routes/dashboard.tsx'
import LoginPage from '@/routes/login.tsx'
import Root from '@/routes/root.tsx'
import SettingsLayout from '@/routes/settings/layout.tsx'
import GeneralPage from '@/routes/settings/page.tsx'
import SettingsSecurityPage from '@/routes/settings/security/page.tsx'
import SettingsServerPage from '@/routes/settings/server/page.tsx'
import SettingsTerminalPage from '@/routes/settings/terminal/page.tsx'
import TerminalPage from '@/routes/terminal'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export const routes = [
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <Navigate to="/dashboard" />,
            },
            {
                path: '/dashboard',
                element: <DashboardPage />,
                nodeRef: createRef(),
            },
            {
                path: '/login',
                element: <LoginPage />,
                nodeRef: createRef(),
            },
            {
                path: '/terminal',
                element: <TerminalPage />,
                nodeRef: createRef(),
            },
            {
                path: '/settings',
                element: <SettingsLayout />,

                children: [
                    {
                        path: '/settings',
                        element: <Navigate to="/settings/general" />,
                        nodeRef: createRef(),
                    },
                    {
                        path: '/settings/general',
                        element: <GeneralPage />,
                        nodeRef: createRef(),
                    },
                    {
                        path: '/settings/security',
                        element: <SettingsSecurityPage />,
                        nodeRef: createRef(),
                    },
                    {
                        path: '/settings/server',
                        element: <SettingsServerPage />,
                        nodeRef: createRef(),
                    },
                    {
                        path: '/settings/terminal',
                        element: <SettingsTerminalPage />,
                        nodeRef: createRef(),
                    },
                ],
            },
        ],
    },
]

const router = createBrowserRouter(routes)

export default router

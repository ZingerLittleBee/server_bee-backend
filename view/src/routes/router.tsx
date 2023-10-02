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

const router = createBrowserRouter([
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
            },
            {
                path: '/login',
                element: <LoginPage />,
            },
            {
                path: '/terminal',
                element: <TerminalPage />,
            },
            {
                path: '/settings',
                element: <SettingsLayout />,
                children: [
                    {
                        path: '/settings',
                        element: <Navigate to="/settings/general" />,
                    },
                    {
                        path: '/settings/general',
                        element: <GeneralPage />,
                    },
                    {
                        path: '/settings/security',
                        element: <SettingsSecurityPage />,
                    },
                    {
                        path: '/settings/server',
                        element: <SettingsServerPage />,
                    },
                    {
                        path: '/settings/terminal',
                        element: <SettingsTerminalPage />,
                    },
                ],
            },
        ],
    },
])

export default router

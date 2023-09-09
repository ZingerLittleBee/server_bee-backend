import { ThemeProvider } from '@/components/theme-provider.tsx'
import { StoreProvider } from '@/store/index.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter, Navigate,
  RouterProvider
} from "react-router-dom"
import ErrorPage from './error-page'
import './globals.css'
import DashboardPage from '@/routes/dashboard'
import LoginPage from '@/routes/login'
import Root from '@/routes/root'
import SettingsLayout from '@/routes/settings/layout'
import GeneralPage from '@/routes/settings/page'
import SettingsSecurityPage from '@/routes/settings/security/page'
import SettingsServerPage from '@/routes/settings/server/page'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: '/login',
        element: <LoginPage />
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
            element: <GeneralPage />
          },
          {
            path: '/settings/security',
            element: <SettingsSecurityPage />
          },
          {
            path: '/settings/server',
            element: <SettingsServerPage />
          }
        ]
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <StoreProvider>
      <RouterProvider router={router} />
    </StoreProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

import {
    kDashboardRoute,
    kSettingsGeneralRoute,
    kTerminalRoute,
} from '@/lib/route'

export type SiteConfig = typeof siteConfig

export const siteConfig = {
    name: 'ServerBee',
    description: '',
    mainNav: {
        dashboard: {
            title: 'Dashboard',
            href: kDashboardRoute,
            cls: 'hidden sm:flex',
        },
        terminal: {
            title: 'Terminal',
            href: kTerminalRoute,
        },
        client: {
            title: 'Settings',
            href: kSettingsGeneralRoute,
        },
    },
    links: {
        twitter: 'https://twitter.com/zinger_bee',
        github: 'https://github.com/ZingerLittleBee/server_bee-backend',
    },
}

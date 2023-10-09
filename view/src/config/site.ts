import { kDashboardRoute, kSettingsRoute, kTerminalRoute } from '@/lib/route'

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
            href: kSettingsRoute,
        },
    },
    links: {
        twitter: 'https://twitter.com/zinger_bee',
        github: 'https://github.com/ZingerLittleBee/server_bee-backend',
    },
}

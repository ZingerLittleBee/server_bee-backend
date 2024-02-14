export type SiteConfig = typeof siteConfig

export const siteConfig = {
    name: 'ServerHub',
    description: 'Hub for ServerBee.',
    mainNav: {
        home: {
            title: 'Panel',
            href: '/',
        },
        dashboard: {
            title: 'Dashboard',
            href: '/dashboard',
        },
        server: {
            title: 'Server',
            href: '/server',
        },
    },
    links: {
        twitter: 'https://twitter.com/zinger_bee',
        github: 'https://github.com/ZingerLittleBee/server-octopus',
    },
}

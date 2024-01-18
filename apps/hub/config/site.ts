export type SiteConfig = typeof siteConfig

export const siteConfig = {
    name: 'ServerBeeHub',
    description:
        'Beautifully designed components built with Radix UI and Tailwind CSS.',
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

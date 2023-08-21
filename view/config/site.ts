import {
  kDashboardRoute, kTokenRoute,
} from "@/lib/route"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "ServerBee",
  description:
      "",
  mainNav: {
    // home: {
    //   title: "Home",
    //   href: "/",
    // },
    dashboard: {
      title: "Dashboard",
      href: kDashboardRoute,
    },
    client: {
      title: "Token",
      href: kTokenRoute,
    },
  },
  links: {
    twitter: "https://twitter.com/zinger_bee",
    github: "https://github.com/ZingerLittleBee/server-octopus",
  },
}

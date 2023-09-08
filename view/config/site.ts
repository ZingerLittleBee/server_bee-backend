import { kDashboardRoute, kSettingsRoute } from "@/lib/route"

export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "ServerBee",
  description: "",
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
      title: "Settings",
      href: kSettingsRoute,
    },
  },
  links: {
    twitter: "https://twitter.com/zinger_bee",
    github: "https://github.com/ZingerLittleBee/server_bee-backend",
  },
}

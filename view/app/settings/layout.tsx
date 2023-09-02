"use client"

import {Separator} from "@/components/ui/separator"
import {SidebarNav} from "./components/sidebar-nav"
import {ReactNode} from "react"
import {Italic} from "@tremor/react";
import {useSettings} from "@/hooks/useSettings";

const sidebarNavItems = [
  {
    title: "General",
    href: "/settings/",
  },
  {
    title: "Security",
    href: "/settings/security",
  },
  {
    title: "Server",
    href: "/settings/server",
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
  },
]

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({children}: SettingsLayoutProps) {

  return (
      <section className="container grid items-center gap-6 pb-8">
        <div className="space-y-6 py-5 pb-16">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your <Italic> ServerBee Backend</Italic> settings and set preferences.
            </p>
          </div>
          <Separator className="my-6"/>
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <SidebarNav items={sidebarNavItems}/>
            </aside>
            <div className="flex-1 lg:max-w-2xl">{children}</div>
          </div>
        </div>
      </section>
  )
}

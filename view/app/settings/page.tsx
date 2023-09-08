"use client"

import { useStore } from "@/store"

import { useSettings } from "@/hooks/useSettings"
import { Separator } from "@/components/ui/separator"
import WithAuth from "@/components/with_auth"
import DashboardPage from "@/app/page"
import GeneralForm from "@/app/settings/general-form"

function SettingsGeneralPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
      <GeneralForm />
    </div>
  )
}

export default WithAuth(SettingsGeneralPage)

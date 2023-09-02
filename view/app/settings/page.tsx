"use client"

import {Separator} from "@/components/ui/separator"
import GeneralForm from "@/app/settings/general-form";
import {useStore} from "@/store";
import {useSettings} from "@/hooks/useSettings";

export default function SettingsGeneralPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">General</h3>
                <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site.
                </p>
            </div>
            <Separator/>
            <GeneralForm/>
        </div>
    )
}

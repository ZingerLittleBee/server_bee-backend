"use client"

import {Separator} from "@/components/ui/separator"
import {SecurityForm} from "./security-form"
import WithAuth from "@/components/with_auth";

export function SettingsSecurityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-sm text-muted-foreground">
                    Update your security settings.
                </p>
            </div>
            <Separator/>
            <SecurityForm/>
        </div>
    )
}

export default WithAuth(SettingsSecurityPage)

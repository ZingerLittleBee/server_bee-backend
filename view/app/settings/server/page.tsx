"use client"

import {Separator} from "@/components/ui/separator"
import {ServerForm} from "./server-form"
import {Bold, Italic} from "@tremor/react";
import WithAuth from "@/components/with_auth";

function SettingsServerPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Server</h3>
                <p className="text-sm text-muted-foreground">
                    Set the config related to the <Bold><Italic>ServerHub</Italic></Bold>, if not used, no need to
                    set.
                </p>
            </div>
            <Separator/>
            <ServerForm/>
        </div>
    )
}

export default WithAuth(SettingsServerPage)

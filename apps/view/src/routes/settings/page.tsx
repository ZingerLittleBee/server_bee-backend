import { Separator } from '@/components/ui/separator'
import WithAuth from '@/components/with_auth'

import GeneralForm from './general-form'

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

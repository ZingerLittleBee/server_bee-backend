import { TerminalForm } from '@/routes/settings/terminal/terminal-form.tsx'

import { Separator } from '@/components/ui/separator.tsx'

export default function SettingsTerminalPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Terminal</h3>
                <p className="text-sm text-muted-foreground">
                    Update your terminal settings.
                </p>
            </div>
            <Separator />
            <TerminalForm />
        </div>
    )
}

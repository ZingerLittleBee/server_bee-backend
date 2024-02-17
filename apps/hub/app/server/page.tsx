import AddOne from '@/app/server/components/form/add-one'
import FormDialog from '@/app/server/components/form/form-dialog'
import ServerTabBlock from '@/app/server/components/tab'
import ConfirmDialog from '@/app/server/components/table/confirm-dialog'
import { TokenDialog } from '@/app/server/components/token-dialog'
import { getData } from '@/app/server/server-action'

export default async function ServerPage() {
    const { servers, groups } = await getData()

    return (
        <div className="h-full flex-1 flex-col space-y-8 py-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Welcome back!
                    </h2>
                    <p className="text-muted-foreground">
                        Here&apos;s a list of your tasks for this month!
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <AddOne />
                </div>
            </div>

            <ServerTabBlock servers={servers} groups={groups} />
            <FormDialog />
            <TokenDialog />
            <ConfirmDialog />
        </div>
    )
}

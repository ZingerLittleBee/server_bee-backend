import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AddServer from '@/app/server/components/form/add-server'
import FormDialog from '@/app/server/components/form/form-dialog'
import GroupTabContent from '@/app/server/components/group'
import { columns } from '@/app/server/components/table/columns'
import ConfirmDialog from '@/app/server/components/table/confirm-dialog'
import { DataTable } from '@/app/server/components/table/data-table'
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
                    <AddServer />
                </div>
            </div>

            <Tabs defaultValue="server" className="w-full">
                <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="server">Server</TabsTrigger>
                    <TabsTrigger value="group">Group</TabsTrigger>
                </TabsList>
                <TabsContent value="server" className="w-full">
                    <DataTable data={servers} columns={columns} />
                </TabsContent>
                <TabsContent value="group">
                    <GroupTabContent groups={groups} />
                </TabsContent>
            </Tabs>
            <FormDialog />
            <TokenDialog />
            <ConfirmDialog />
        </div>
    )
}

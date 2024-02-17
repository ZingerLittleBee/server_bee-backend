'use client'

import { useBoundStore } from '@/store'
import type { RouterOutputs } from '@/trpc/shared'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GroupTabContent from '@/app/server/components/group'
import { columns, type Server } from '@/app/server/components/table/columns'
import { DataTable } from '@/app/server/components/table/data-table'
import { ServerTabEnum } from '@/app/server/store'

export type ServerTabBlockProps = {
    servers: Server[]
    groups: RouterOutputs['group']['list']
}

export default function ServerTabBlock({
    servers,
    groups,
}: ServerTabBlockProps) {
    const currentTab = useBoundStore.use.currentTab()
    const setCurrentTab = useBoundStore.use.setCurrentTab()

    return (
        <Tabs
            defaultValue={currentTab}
            className="w-full"
            onValueChange={(value) => setCurrentTab(value as ServerTabEnum)}
        >
            <TabsList className="grid w-[200px] grid-cols-2">
                {Object.keys(ServerTabEnum).map((key) => (
                    <TabsTrigger value={key} key={key}>
                        {key}
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value={ServerTabEnum.Server} className="w-full">
                <DataTable data={servers} columns={columns} />
            </TabsContent>
            <TabsContent value={ServerTabEnum.Group}>
                <GroupTabContent groups={groups} />
            </TabsContent>
        </Tabs>
    )
}

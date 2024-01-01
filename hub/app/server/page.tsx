import * as React from 'react'
import { api } from '@/trpc/server'

import AddServer from '@/app/server/add-server'
import { columns, type Server } from '@/app/server/columns'
import FormDialog from '@/app/server/components/form-dialog'
import { TokenDialog } from '@/app/server/components/token-dialog'
import { DataTable } from '@/app/server/data-table'

async function getData(): Promise<Server[]> {
    const servers = await api.server.list.query()

    return servers.map<Server>((server) => ({
        id: server.id,
        name: server.name,
        description: server.description ?? undefined,
        createdAt: server.createdAt,
    }))
}

export default async function ServerPage() {
    const servers = await getData()

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
            <DataTable data={servers} columns={columns} />
            <FormDialog />
            <TokenDialog />
        </div>
    )
}

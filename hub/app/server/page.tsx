import * as React from 'react'
import { api } from '@/trpc/server'

import { columns, type Payment } from '@/app/server/columns'
import { DataTable } from '@/app/server/data-table'

async function getData(): Promise<Payment[]> {
    return [
        {
            id: '728ed52f',
            amount: 100,
            status: 'pending',
            email: 'm@example.com',
        },
    ]
}

export default async function ServerPage() {
    const data = await getData()

    const d = await api.server.list.query()

    console.log('ServerPage d', d)

    return (
        <div className="h-full flex-1 flex-col space-y-8 py-8">
            <DataTable columns={columns} data={data} />
        </div>
    )
}

import * as React from 'react'
import { api } from '@/trpc/server'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { columns, type Server } from '@/app/server/columns'
import { DataTable } from '@/app/server/data-table'
import { ServerForm } from '@/app/server/server-form'

async function getData(): Promise<Server[]> {
    return [
        {
            id: '728ed52f',
            name: 'Server 1',
            description: 'Server 1 description',
            createdAt: '2021-10-01T12:00:00Z',
        },
    ]
}

export default async function ServerPage() {
    const data = await getData()

    const d = await api.server.list.query()

    console.log('ServerPage d', d)

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
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <PlusCircle />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Server</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click
                                    save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <ServerForm />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <DataTable data={data} columns={columns} />
        </div>
    )
}

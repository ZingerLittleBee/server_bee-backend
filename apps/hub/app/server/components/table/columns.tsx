'use client'

import { useRouter } from 'next/navigation'
import { useBoundStore } from '@/store'
import { api } from '@/trpc/react'
import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { DataTableColumnHeader } from '@/app/_components/data-table/data-table-column-header'
import { getData } from '@/app/server/server-action'

export type Server = {
    id: string
    name: string
    description: string | null
    createdAt: Date
}

export const columns: ColumnDef<Server>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const router = useRouter()
            const setIsOpen = useBoundStore.use.setIsOpenTokenDialog()
            const setTokenDialogProps = useBoundStore.use.setTokenDialogProps()
            const setIsOpenConfirmDialog =
                useBoundStore.use.setIsOpenConfirmDialog()
            const setConfirmDialogProps =
                useBoundStore.use.setConfirmDialogProps()
            const tokens = api.server.getTokens.useQuery({
                id: row.original.id,
            })
            const { mutateAsync: deleteServer } =
                api.server.delete.useMutation()
            const server = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>View</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={async () => {
                                await navigator.clipboard.writeText(server.id)
                                toast({
                                    title: 'Server ID copied successfully!',
                                })
                            }}
                        >
                            Copy server ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setTokenDialogProps({
                                    title: 'Token list',
                                    tokens: tokens.data ?? [],
                                })
                                setIsOpen(true)
                            }}
                        >
                            View tokens
                        </DropdownMenuItem>
                        <DropdownMenuItem>View server details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => {
                                setTokenDialogProps({
                                    title: 'Token list',
                                    tokens: tokens.data ?? [],
                                })
                                setIsOpen(true)
                            }}
                        >
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                                setConfirmDialogProps({
                                    onConfirm: async () => {
                                        await deleteServer(server.id)
                                        await getData()
                                        router.refresh()
                                    },
                                })
                                setIsOpenConfirmDialog(true)
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
    {
        accessorKey: 'id',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ID" />
        ),
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
    },
    {
        accessorKey: 'description',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="CreateTime" />
        ),
        cell: ({ row }) => {
            const createdAt = row.getValue<Date>('createdAt')

            const formatted = createdAt
                ? format(createdAt, 'yyyy-MM-dd HH:mm:ss')
                : ''

            return <div className="font-medium">{formatted}</div>
        },
    },
]

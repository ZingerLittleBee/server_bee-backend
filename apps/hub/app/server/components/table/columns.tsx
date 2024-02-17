'use client'

import { useRouter } from 'next/navigation'
import { FormMode } from '@/constant/enum/mode'
import { useBoundStore } from '@/store'
import { api } from '@/trpc/react'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
import { type FormValues } from '@/app/server/components/form/server-form'
import { getData } from '@/app/server/server-action'

export type Server = {
    id: string
    name: string
    description: string | null
    sortWeight: number
    group?: {
        id: string
        name: string
    } | null
}

const Actions = ({ row }: { row: Row<Server> }) => {
    const router = useRouter()
    const setIsOpen = useBoundStore.use.setIsOpenTokenDialog()
    const setTokenDialogProps = useBoundStore.use.setTokenDialogProps()
    const setIsOpenConfirmDialog = useBoundStore.use.setIsOpenConfirmDialog()
    const setConfirmDialogProps = useBoundStore.use.setConfirmDialogProps()
    const setIsOpenServerForm = useBoundStore.use.setIsOpenServerForm()
    const setServerFormProps = useBoundStore.use.setServerFormProps()
    const tokens = api.server.getTokens.useQuery({
        id: row.original.id,
    })
    const { mutateAsync: deleteServer } = api.server.delete.useMutation()
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
                        setServerFormProps({
                            mode: FormMode.Edit,
                            id: server.id,
                            server: {
                                ...server,
                                group: server.group?.id,
                                sortWeight: server.sortWeight.toString(),
                            } as FormValues,
                        })
                        setIsOpenServerForm(true)
                    }}
                >
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => {
                        setConfirmDialogProps({
                            onConfirm: () =>
                                void (async () => {
                                    await deleteServer(server.id)
                                    await getData()
                                    router.refresh()
                                })(),
                        })
                        setIsOpenConfirmDialog(true)
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
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
        accessorKey: 'sortWeight',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="SortWeight" />
        ),
    },
    {
        id: 'group',
        header: 'Group',
        cell: ({ row }) => {
            const group = row.original.group
            return (
                group && (
                    <Badge variant="secondary">
                        {group ? group.name : '—'}
                    </Badge>
                )
            )
        },
    },
    {
        id: 'actions',
        cell: Actions,
    },
]

'use client'

import { useRouter } from 'next/navigation'
import { FormMode } from '@/constant/enum/mode'
import { useBoundStore } from '@/store'
import { type RouterOutputs } from '@/trpc/shared'
import { Bold, Flex, Italic, Subtitle, Text } from '@tremor/react'
import { MoreHorizontal } from 'lucide-react'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getData } from '@/app/server/server-action'

export type GroupTabContentProps = {
    groups: RouterOutputs['group']['list']
}

export default function GroupTabContent({ groups }: GroupTabContentProps) {
    return (
        <Accordion type="multiple" className="w-full">
            {groups?.map((group) => (
                <AccordionItem key={group.id} value={group.id}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="space-x-4">
                            <GroupAction group={group} />
                            <Badge variant="outline" className="space-x-2">
                                <Bold>{group.servers.length ?? 0}</Bold>
                                <Text className="text-xs">Items</Text>
                            </Badge>
                            <span className="hover:underline">
                                {group.name}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                {group.description}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {group.servers?.length > 0 ? (
                            group.servers?.map((server) => (
                                <Flex
                                    key={server.id}
                                    justifyContent="start"
                                    className="gap-4"
                                >
                                    <Badge variant="secondary">
                                        {server.name}
                                    </Badge>
                                    <Subtitle>{server.description}</Subtitle>
                                </Flex>
                            ))
                        ) : (
                            <Text>
                                <Italic>No servers</Italic>
                            </Text>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

const GroupAction = ({
    group,
}: {
    group: RouterOutputs['group']['list'][number]
}) => {
    const router = useRouter()
    const setIsOpen = useBoundStore.use.setIsOpenServerForm()
    const setGroupFormProps = useBoundStore.use.setGroupFormProps()
    const setIsOpenConfirmDialog = useBoundStore.use.setIsOpenConfirmDialog()
    const setConfirmDialogProps = useBoundStore.use.setConfirmDialogProps()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open group actions</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
                <DropdownMenuLabel onClick={(e) => e.stopPropagation()}>
                    Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={(e) => {
                        setGroupFormProps({
                            mode: FormMode.Edit,
                            id: group.id,
                            group: {
                                name: group.name,
                                description: group.description ?? undefined,
                                sortWeight: group.sortWeight.toString(),
                            },
                            onSubmit: () => setIsOpen(false),
                        })
                        setIsOpen(true)
                        e.stopPropagation()
                    }}
                >
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-red-500"
                    onClick={(e) => {
                        setConfirmDialogProps({
                            onConfirm: () =>
                                void (async () => {
                                    // DELETE GROUP
                                    await getData()
                                    router.refresh()
                                })(),
                        })
                        setIsOpenConfirmDialog(true)
                        e.stopPropagation()
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

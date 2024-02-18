'use client'

import { useMemo, type HTMLAttributes } from 'react'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import NoDataIcon from '@/public/assets/no-data.svg'
import type { RouterOutputs } from '@/trpc/shared'
import { Text } from '@tremor/react'

import { cn } from '@/lib/utils'
import useFilterServerList from '@/hooks/useFilterServerList'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import PanelCard, { PanelCardSkeleton } from '@/app/panel/components/card'
import FilterTool from '@/app/panel/components/filter/index'

export type PanelPageProps = {
    groups: RouterOutputs['group']['list']
}

const PanelPage = ({ groups }: PanelPageProps) => {
    const servers = useFilterServerList()

    const data = useMemo<
        {
            group?: {
                id: string
                name: string
                description?: string | null
                sortWeight: number
            }
            servers: typeof servers
        }[]
    >(() => {
        const serverInGroups = groups?.map((group) => {
            return {
                group: {
                    id: group.id,
                    name: group.name,
                    description: group.description,
                    sortWeight: group.sortWeight,
                },
                servers: servers.filter((s) => s.group?.id === group.id),
            }
        })
        const serverNoGroup = servers.filter((server) => !server.group)
        return [
            ...serverInGroups.filter((g) => g.servers.length > 0),

            ...(serverNoGroup.length > 0
                ? [
                      {
                          group: undefined,
                          servers: serverNoGroup,
                      },
                  ]
                : []),
        ]
    }, [servers, groups])

    return (
        <div className="grid h-full">
            <FilterTool className="container" />
            {data.length === 0 ? (
                <EmptyDataView className="h-[calc(100vh-65px-40px)]" />
            ) : (
                <ScrollArea className="h-[calc(100vh-65px-40px)]">
                    <Accordion
                        type="multiple"
                        className="container space-y-4 px-8 pb-8"
                        defaultValue={data.map((d) =>
                            d.group ? d.group.name : 'No Group'
                        )}
                    >
                        {data.map((d) => (
                            <AccordionItem
                                key={d.group?.id ?? 'no-group'}
                                value={d.group ? d.group.name : 'No Group'}
                                className="rounded-lg border border-slate-200 px-2 dark:border-slate-800"
                            >
                                <AccordionTrigger className="px-2">
                                    {d.group ? d.group.name : 'No Group'}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                        {d.servers?.map(
                                            ({
                                                id,
                                                name,
                                                record,
                                                status,
                                                networkHistory,
                                            }) =>
                                                record ? (
                                                    <PanelCard
                                                        key={id}
                                                        id={id}
                                                        name={name}
                                                        record={record}
                                                        status={status}
                                                        networkHistory={
                                                            networkHistory
                                                        }
                                                        className="w-full"
                                                    />
                                                ) : (
                                                    <PanelCardSkeleton
                                                        key={id}
                                                        name={name}
                                                    />
                                                )
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollArea>
            )}
        </div>
    )
}

const EmptyDataView = ({ className }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                'container grid content-center justify-center gap-4',
                className
            )}
        >
            <Image
                src={NoDataIcon as StaticImport}
                alt="no data"
                width={180}
                height={180}
            />
            <Text className="text-center">No Data</Text>
        </div>
    )
}

export default PanelPage

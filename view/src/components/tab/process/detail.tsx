import { useMemo } from 'react'
import { useStore } from '@/store'
import { Bold, Italic, Text, Card as TremorCard } from '@tremor/react'
import dayjs, { unix } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CornerLeftUp, CornerUpLeft } from 'lucide-react'

import { DiskIO } from '@/types/fusion.ts'
import { formatToString } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx'
import { STooltip } from '@/components/s-tooltip.tsx'

import { ScrollArea } from '../../ui/scroll-area.tsx'

dayjs.extend(duration)
dayjs.extend(relativeTime)

export default function ProcessDetail() {
    const { fusion } = useStore()
    const process = fusion.current_process

    const data = useMemo(() => {
        return [
            {
                title: 'PID',
                metric: process?.pid,
            },
            {
                title: 'Parent ID',
                metric: process?.parent,
            },
            {
                title: 'User',
                metric: process?.user,
            },
            {
                title: 'CPU',
                metric: process?.cpu,
            },
            {
                title: 'Memory',
                metric: formatToString(process?.memory),
            },
            {
                title: 'Swap',
                metric: formatToString(process?.vir_mem),
            },
            {
                title: 'Running Time',
                metric: dayjs
                    .duration(parseInt(process?.run_time ?? '0'), 'seconds')
                    .humanize(),
            },
            {
                title: 'Boot Time',
                metric: unix(parseInt(process?.start_time ?? '0')).format(
                    'YYYY-MM-DD HH:mm:ss'
                ),
            },
        ]
    }, [process])

    return process ? (
        <ScrollArea
            className="w-full rounded-lg border"
            viewportClassName="max-h-[665px]"
        >
            <Card className="h-full border-none shadow-none">
                <CardHeader className="sticky top-0 z-[100] mb-6 flex flex-row items-center justify-between space-x-2 space-y-0 rounded-t-lg bg-muted px-6 py-1">
                    <p className="text-lg font-bold">{process?.name}</p>
                    {process?.status && <Badge>{process?.status}</Badge>}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                        {data
                            .filter((d) => d.metric != undefined)
                            .map((item) => (
                                <TremorCard
                                    key={item.title}
                                    className="col-span-1"
                                >
                                    <Text>{item.title}</Text>
                                    <Bold>{item.metric}</Bold>
                                </TremorCard>
                            ))}
                        {process?.disk && (
                            <TremorCard className="col-span-full">
                                <Text>Disk</Text>
                                <div className="flex justify-between">
                                    {process?.disk &&
                                        [
                                            'read',
                                            'write',
                                            'total_read',
                                            'total_write',
                                        ].map((key, index) => {
                                            return (
                                                <div key={`${key}-${index}`}>
                                                    <Text>{key}</Text>
                                                    <Bold>
                                                        {formatToString(
                                                            process?.disk[
                                                                key as keyof DiskIO
                                                            ]
                                                        )}
                                                    </Bold>
                                                </div>
                                            )
                                        })}
                                </div>
                            </TremorCard>
                        )}
                        {process?.exe && (
                            <TremorCard className="col-span-full">
                                <Text>Executable</Text>
                                <STooltip content={process?.exe}>
                                    <p className="truncate font-bold">
                                        {process?.exe}
                                    </p>
                                </STooltip>
                            </TremorCard>
                        )}
                        {process?.cmd?.length > 0 && (
                            <TremorCard className="col-span-full">
                                <Text>Command</Text>
                                {process?.cmd.map((cmd, index) => (
                                    <STooltip
                                        key={`${cmd}-${index}`}
                                        content={cmd}
                                    >
                                        <p className="truncate font-bold">
                                            {cmd}
                                        </p>
                                    </STooltip>
                                ))}
                            </TremorCard>
                        )}
                        {process?.environ?.length > 0 && (
                            <TremorCard className="col-span-full">
                                <Text>Environ</Text>
                                <ScrollArea className="h-64">
                                    {process?.environ.map((env, index) => {
                                        return (
                                            <STooltip
                                                key={`${env}-${index}`}
                                                content={env}
                                            >
                                                <p className="truncate font-bold">
                                                    {env}
                                                </p>
                                            </STooltip>
                                        )
                                    })}
                                </ScrollArea>
                            </TremorCard>
                        )}
                    </div>
                </CardContent>
            </Card>
        </ScrollArea>
    ) : (
        <NoDataView />
    )
}

const NoDataView = () => {
    return (
        <div className="flex h-full items-center space-x-2">
            <CornerUpLeft className="hidden h-6 w-6 lg:block lg:animate-bounce" />
            <CornerLeftUp className="block h-6 w-6 animate-bounce lg:hidden" />

            <Text>Click</Text>
            <Italic>PID</Italic>
            <Text>column to view process detail</Text>
        </div>
    )
}

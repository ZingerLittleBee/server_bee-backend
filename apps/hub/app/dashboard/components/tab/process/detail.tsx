import { useMemo } from 'react'
import { type DiskIO } from '@serverbee/types'
import { Bold, Italic, Text, Card as TremorCard } from '@tremor/react'
import dayjs, { unix } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CornerLeftUp, CornerUpLeft } from 'lucide-react'

import { formatToString } from '@/lib/unit'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { STooltip } from '@/components/s-tooltip'
import useFusion from '@/app/dashboard/hooks/useFusion'

dayjs.extend(duration)
dayjs.extend(relativeTime)

export default function ProcessDetail() {
    const fusion = useFusion()

    const process = useMemo(
        () => fusion?.current_process,
        [fusion?.current_process]
    )

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
        <Card className="size-full border shadow-none">
            <CardHeader className="sticky top-0 z-[100] w-full rounded-t-lg bg-muted px-6 py-1.5">
                <div className="flex flex-row flex-wrap items-center justify-between">
                    <p className="w-fit max-w-full break-words text-lg font-bold">
                        {process?.name}
                    </p>
                    {process?.status && <Badge>{process?.status}</Badge>}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea
                    className="w-full rounded-lg px-5"
                    viewportClassName="max-h-[629px]"
                >
                    <div className="my-4 grid grid-cols-2 gap-6 px-1 sm:grid-cols-3">
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
                </ScrollArea>
            </CardContent>
        </Card>
    ) : (
        <NoDataView />
    )
}

const NoDataView = () => {
    return (
        <div className="flex h-full items-center space-x-2">
            <CornerUpLeft className="hidden size-6 lg:block lg:animate-bounce" />
            <CornerLeftUp className="block size-6 animate-bounce lg:hidden" />

            <Text>Click</Text>
            <Italic>PID</Italic>
            <Text>column to view process detail</Text>
        </div>
    )
}

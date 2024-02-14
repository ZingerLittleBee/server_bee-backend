import { useMemo, type FC, type HTMLAttributes } from 'react'
import { StatusEnum } from '@/constant/enum/status'
import { StatusOnlineIcon } from '@heroicons/react/solid'
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons'
import { type NetworkIO, type Record } from '@serverbee/types'
import {
    Badge,
    Bold,
    Card,
    CategoryBar,
    Divider,
    Flex,
    ProgressBar,
    ProgressCircle,
    SparkAreaChart,
    Text,
    Title,
    Tracker,
} from '@tremor/react'
import { format } from 'date-fns'
import {
    Activity,
    ArrowDownCircle,
    ArrowUpCircle,
    Cpu,
    HardDrive,
    MemoryStick,
    Network,
} from 'lucide-react'

import { formatToString, toGiB, toMiB } from '@/lib/unit'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { STooltip } from '@/components/s-tooltip'
import InfoTooltip, { InfoColorEnum } from '@/app/panel/components/info-tooltip'

export type PanelCardProps = {
    id: string
    name: string
    record: Record
    networkHistory: NetworkIO[]
} & HTMLAttributes<HTMLDivElement>

export default function PanelCard({
    name,
    record,
    networkHistory,
    className,
}: PanelCardProps) {
    const { fusion, time } = useMemo(() => record, [record])
    const overview = useMemo(() => fusion?.overview, [fusion?.overview])

    const memValues = useMemo(() => {
        const { used, total } = overview?.memory_usage ?? {}
        const usedNum = isNaN(parseInt(used?.[0])) ? 0 : parseInt(used[0])
        const totalNum = isNaN(parseInt(total?.[0])) ? 0 : parseInt(total[0])
        const percent = Math.round(
            totalNum === 0 ? 0 : (usedNum / totalNum) * 100
        )
        return [percent, 100 - percent]
    }, [overview?.memory_usage])

    const memory = useMemo(
        () => overview?.memory_usage,
        [overview?.memory_usage]
    )
    const memoryTotal = useMemo(() => {
        return [
            {
                key: 'Used',
                value: memory?.swap_used
                    ? formatToString(memory?.swap_used)
                    : 'N/A',
                color: InfoColorEnum.Amber,
            },
            {
                key: 'Total',
                value: memory?.swap_total
                    ? formatToString(memory?.swap_total)
                    : 'N/A',
                color: InfoColorEnum.Emerald,
            },
        ]
    }, [memory])

    const network = useMemo(() => overview?.network_io, [overview?.network_io])
    const netHistory = useMemo(() => {
        return networkHistory.map(({ rx, tx }, index) => ({
            rx: toMiB(rx),
            tx: toMiB(tx),
            index,
        }))
    }, [networkHistory])
    const networkTotal = useMemo(() => {
        const network = networkHistory.at(-1)
        return [
            {
                key: 'Transmit',
                value: network?.tx ? formatToString(network?.tx) : 'N/A',
                color: InfoColorEnum.Violet,
            },
            {
                key: 'Receive',
                value: network?.rx ? formatToString(network?.rx) : 'N/A',
                color: InfoColorEnum.Green,
            },
        ]
    }, [networkHistory])

    const disk = useMemo(() => overview?.disk_io, [overview?.disk_io])
    const diskUsage = useMemo(
        () => overview?.disk_usage,
        [overview?.disk_usage]
    )

    const diskUsedPercent = useMemo(() => {
        const used = toGiB(diskUsage?.used)
        const total = toGiB(diskUsage?.total)

        return total === 0 ? 0 : Math.round((used / total) * 100)
    }, [diskUsage])

    const diskTotal = useMemo(() => {
        const diskIo = overview?.disk_io
        return [
            {
                key: 'Read',
                value: diskIo?.total_read
                    ? formatToString(diskIo?.total_read)
                    : 'N/A',
                color: InfoColorEnum.Teal,
            },
            {
                key: 'Write',
                value: diskIo?.total_write
                    ? formatToString(diskIo?.total_write)
                    : 'N/A',
                color: InfoColorEnum.Fuchsia,
            },
        ]
    }, [overview?.disk_io])

    const status = useMemo(() => {
        if (!time) return StatusEnum.Pending
        if (Math.floor(Date.now() / 1000) - time > 60) return StatusEnum.Offline
        return StatusEnum.Online
    }, [time])

    if (!record) return <></>

    return (
        <Card className={cn('w-[300px] space-y-4 p-4 pt-2', className)}>
            <div>
                <Flex justifyContent="between">
                    <Title>{name}</Title>
                    <STooltip
                        content={format(time * 1000, 'yyyy-MM-dd HH:mm:ss')}
                    >
                        <div>
                            <StatusBadge status={status} />
                        </div>
                    </STooltip>
                </Flex>
                <Divider className="my-1" />
            </div>
            <Flex className="truncate" justifyContent="between">
                <Flex className="truncate" justifyContent="start">
                    <Text className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        <Bold>Load</Bold>
                    </Text>
                </Flex>
                <Text color="purple">
                    <STooltip content="1 min | 5 min | 15 min">
                        <Bold>{overview?.load_avg.join(' | ')}</Bold>
                    </STooltip>
                </Text>
            </Flex>
            <div className="flex flex-col gap-2">
                <Flex className="truncate" justifyContent="between">
                    <Flex className="truncate" justifyContent="start">
                        <Text className="flex items-center gap-1">
                            <Cpu className="h-4 w-4" />
                            <Bold>CPU</Bold>
                        </Text>
                    </Flex>
                    <Text color="indigo">
                        <Bold>{overview?.cpu_usage}%</Bold>
                    </Text>
                </Flex>
                <ProgressBar
                    color="indigo"
                    showAnimation={true}
                    value={parseInt(overview?.cpu_usage ?? '0')}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Flex className="flex-wrap gap-x-4" justifyContent="between">
                    <Flex className="w-auto truncate" justifyContent="start">
                        <Text className="flex items-center gap-1">
                            <MemoryStick className="h-4 w-4" />
                            <Bold>Mem</Bold>
                        </Text>
                        <InfoTooltip data={memoryTotal} title="Swap" />
                    </Flex>
                    <Flex justifyContent="start" className="w-auto gap-4">
                        <STooltip content="Used">
                            <div className="flex items-center gap-1">
                                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-amber-200 text-[10px] font-bold text-amber-600 dark:border-amber-600 dark:text-amber-400">
                                    U
                                </div>
                                <Text color="amber">
                                    <Bold>
                                        {memory?.used
                                            ? formatToString(memory?.used)
                                            : 'N/A'}
                                    </Bold>
                                </Text>
                            </div>
                        </STooltip>
                        <STooltip content="Total">
                            <div className="flex items-center gap-1">
                                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-200 text-[10px] font-bold text-emerald-600 dark:border-emerald-600 dark:text-emerald-400">
                                    T
                                </div>
                                <Text color="emerald">
                                    <Bold>
                                        {memory?.used
                                            ? formatToString(memory?.total)
                                            : 'N/A'}
                                    </Bold>
                                </Text>
                            </div>
                        </STooltip>
                    </Flex>
                </Flex>
                <CategoryBar
                    values={memValues}
                    colors={['amber', 'emerald']}
                    markerValue={memValues[0]}
                    showLabels={false}
                    showAnimation={true}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Flex className="flex-wrap" justifyContent="between">
                    <Flex className="w-auto truncate" justifyContent="start">
                        <Text className="flex items-center gap-1 ">
                            <Network className="h-4 w-4" />
                            <Bold>Net</Bold>
                        </Text>
                        <InfoTooltip data={networkTotal} />
                    </Flex>
                    <div className="flex gap-2">
                        <Text
                            color="violet"
                            className="flex items-center gap-1 dark:text-violet-400"
                        >
                            <STooltip content="Transmit">
                                <ArrowUpCircle className="h-4 w-4" />
                            </STooltip>
                            <STooltip content="Transmit">
                                <Bold>
                                    {network?.tx
                                        ? formatToString(network?.tx)
                                        : 'N/A'}
                                </Bold>
                            </STooltip>
                        </Text>
                        <Text
                            color="green"
                            className="flex items-center gap-1
                            text-green-700 dark:text-green-500"
                        >
                            <STooltip content="Receive">
                                <ArrowDownCircle className="h-4 w-4" />
                            </STooltip>
                            <STooltip content="Receive">
                                <Bold>
                                    {network?.rx
                                        ? formatToString(network?.rx)
                                        : 'N/A'}
                                </Bold>
                            </STooltip>
                        </Text>
                    </div>
                </Flex>
                <Flex className="gap-4">
                    <SparkAreaChart
                        data={netHistory}
                        categories={['rx', 'tx']}
                        index={'index'}
                        colors={['emerald', 'violet']}
                        className="h-12 w-full"
                    />
                </Flex>
            </div>
            <div
                className="flex flex-col gap-2"
                style={{
                    marginTop: '0',
                }}
            >
                <Flex className="flex-wrap gap-x-4" justifyContent="between">
                    <Flex justifyContent="start" className="w-auto truncate">
                        <Text className="flex items-center gap-1">
                            <HardDrive className="h-4 w-4" />
                            <Bold>Disk</Bold>
                        </Text>
                        <InfoTooltip data={diskTotal} />
                    </Flex>
                    <Flex justifyContent="start" className="w-auto gap-x-4">
                        <div className="flex gap-2">
                            <div className="flex items-center justify-center space-x-2">
                                <Tracker
                                    data={[{ color: 'cyan', tooltip: 'Read' }]}
                                    className="flex h-3 w-2 items-center justify-center"
                                />
                                <Text color="cyan">
                                    {disk?.read
                                        ? formatToString(disk?.read)
                                        : 'N/A'}
                                </Text>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <Tracker
                                    data={[
                                        { color: 'fuchsia', tooltip: 'Write' },
                                    ]}
                                    className="flex h-3 w-2 items-center justify-center"
                                />
                                <Text color="fuchsia">
                                    {disk?.write
                                        ? formatToString(disk?.write)
                                        : 'N/A'}
                                </Text>
                            </div>
                        </div>
                        <ProgressCircle
                            value={diskUsedPercent}
                            radius={20}
                            strokeWidth={4}
                            tooltip={`Used: ${formatToString(
                                diskUsage?.used
                            )}, Total: ${formatToString(diskUsage?.total)}`}
                        >
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {diskUsedPercent}%
                            </span>
                        </ProgressCircle>
                    </Flex>
                </Flex>
            </div>
        </Card>
    )
}

const StatusBadge: FC<{ status: StatusEnum }> = ({ status }) => {
    switch (status) {
        case StatusEnum.Online:
            return <Badge icon={StatusOnlineIcon}>Online</Badge>
        case StatusEnum.Offline:
            return (
                <Badge icon={QuestionMarkCircledIcon} color="red">
                    Offline
                </Badge>
            )
        default:
            return (
                <Badge icon={QuestionMarkCircledIcon} color="orange">
                    Pending
                </Badge>
            )
    }
}

export const PanelCardSkeleton = ({ name }: { name?: string }) => {
    return (
        <Card className="w-full space-y-4 p-4 pt-2">
            <div>
                <Flex justifyContent="between">
                    {name ? (
                        <Title>{name}</Title>
                    ) : (
                        <Skeleton className="h-4 w-[100px]" />
                    )}
                    <Skeleton className="h-4 w-[50px]" />
                </Flex>
                <Divider className="my-1" />
            </div>
            <Flex className="truncate" justifyContent="between">
                <Flex className="truncate" justifyContent="start">
                    <Text className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        <Bold>Load</Bold>
                    </Text>
                </Flex>
                <Skeleton className="h-4 w-[50px]" />
            </Flex>
            <div className="flex flex-col gap-2">
                <Flex className="truncate" justifyContent="between">
                    <Flex className="truncate" justifyContent="start">
                        <Text className="flex items-center gap-1">
                            <Cpu className="h-4 w-4" />
                            <Bold>CPU</Bold>
                        </Text>
                    </Flex>
                    <Skeleton className="h-4 w-[50px]" />
                </Flex>
                <Skeleton className="h-2 w-full" />
            </div>
            <div className="flex flex-col gap-2">
                <Flex className="gap-4 truncate" justifyContent="between">
                    <Flex className="truncate" justifyContent="start">
                        <Text className="flex items-center gap-1">
                            <MemoryStick className="h-4 w-4" />
                            <Bold>Mem</Bold>
                        </Text>
                    </Flex>
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-[50px]" />
                        <Skeleton className="h-4 w-[50px]" />
                    </div>
                </Flex>

                <Skeleton className="h-2 w-full" />
            </div>
            <div className="flex flex-col gap-2">
                <Flex className="truncate" justifyContent="between">
                    <Flex className="truncate" justifyContent="start">
                        <Text className="flex items-center gap-1">
                            <Network className="h-4 w-4" />
                            <Bold>Net</Bold>
                        </Text>
                    </Flex>
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-[50px]" />
                        <Skeleton className="h-4 w-[50px]" />
                    </div>
                </Flex>
                <Flex className="gap-4">
                    <Skeleton className="h-12 w-full" />
                </Flex>
            </div>
            <div
                className="flex flex-col gap-2"
                style={{
                    marginTop: '0',
                }}
            >
                <Flex className="gap-4" justifyContent="between">
                    <Flex className="truncate" justifyContent="start">
                        <Text className="flex items-center gap-1">
                            <HardDrive className="h-4 w-4" />
                            <Bold>Disk</Bold>
                        </Text>
                    </Flex>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-[50px]" />
                        <Skeleton className="h-4 w-[50px]" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                </Flex>
            </div>
        </Card>
    )
}

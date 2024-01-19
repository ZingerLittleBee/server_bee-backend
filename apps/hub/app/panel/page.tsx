'use client'

import { FC, HTMLAttributes, useMemo } from 'react'
import { type FormatData } from '@serverbee/types'
import {
    Bold,
    Card,
    CategoryBar,
    Flex,
    Icon,
    ProgressBar,
    Text,
    Title,
} from '@tremor/react'
import { Cpu, MemoryStick } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useStore } from '@/app/dashboard/store'

export default function PanelPage() {
    const { fusion } = useStore()
    const overview = fusion?.overview

    const memValues = useMemo(() => {
        const { used, total } = overview?.memory_usage

        const usedNum = isNaN(parseInt(used[0])) ? 0 : parseInt(used[0])
        const totalNum = isNaN(parseInt(total[0])) ? 0 : parseInt(total[0])

        const percent = Math.round(
            totalNum === 0 ? 0 : (usedNum / totalNum) * 100
        )

        return [percent, 100 - percent]
    }, [overview?.memory_usage])

    return (
        <Card className="mx-auto max-w-md space-y-4">
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
                <Flex className="truncate" justifyContent="between">
                    <Flex className="truncate" justifyContent="start">
                        <Text className="flex items-center gap-1">
                            <MemoryStick className="h-4 w-4" />
                            <Bold>Mem</Bold>
                        </Text>
                    </Flex>
                    <Text color="slate">
                        <Bold>{overview?.memory_usage.used} / </Bold>
                    </Text>
                    <Text color="blue">
                        <Bold>{overview?.memory_usage.total}</Bold>
                    </Text>
                </Flex>
                <CategoryBar
                    values={memValues}
                    colors={['slate', 'blue']}
                    markerValue={memValues[0]}
                    showLabels={false}
                    showAnimation={true}
                />
            </div>
        </Card>

        // <Card className="w-[300px]">
        //     <CardHeader className="p-4">
        //         <CardTitle>Server1</CardTitle>
        //         <CardDescription>Server1 Descriptions</CardDescription>
        //     </CardHeader>
        //     <CardContent className="px-4">
        //         <div className="grid grid-cols-1 gap-3 gap-y-4">
        //             <div className="grid gap-1">
        //                 <div className="flex items-center gap-1 text-muted-foreground">
        //                     <Cpu className="h-4 w-4" />
        //                     <span className="text-sm">CPU</span>
        //                 </div>
        //                 <div>
        //                     <span>{`${overview?.cpu_usage}%`}</span>
        //                     <p className="flex items-end gap-1">
        //                         <span className="text-xs text-muted-foreground">
        //                             Load: {overview?.load_avg.join(' | ')}
        //                         </span>
        //                     </p>
        //                 </div>
        //             </div>
        //             <div className="grid gap-1">
        //                 <div className="flex items-center gap-1 text-muted-foreground">
        //                     <MemoryStick className="h-4 w-4" />
        //                     <span className="text-sm">Mem</span>
        //                 </div>
        //                 <div className="flex flex-col">
        //                     <div className="flex items-end gap-1">
        //                         <ValueWithUnitBlock
        //                             data={overview?.memory_usage.used}
        //                         />
        //                     </div>
        //                     <div className="flex items-end gap-1">
        //                         <span className="text-xs text-muted-foreground">
        //                             Total:{' '}
        //                             {formatDataToString(
        //                                 overview?.memory_usage.total
        //                             )}
        //                         </span>
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="grid gap-1">
        //                 <div className="flex items-center gap-1 text-muted-foreground">
        //                     <Network className="h-4 w-4" />
        //                     <span className="text-sm">Net</span>
        //                 </div>
        //                 <div className="grid gap-1">
        //                     <div className="flex items-center gap-2">
        //                         <ValueWithUnitBlock
        //                             data={overview?.network_io.tx}
        //                         />
        //                         <Badge
        //                             variant="outline"
        //                             className="flex h-4 w-4 items-center justify-center p-0 text-slate-400"
        //                         >
        //                             <STooltip content="TX">
        //                                 <ArrowUp className="h-3 w-3" />
        //                             </STooltip>
        //                         </Badge>
        //                     </div>
        //                     <div className="flex items-center gap-2">
        //                         <ValueWithUnitBlock
        //                             data={overview?.network_io.rx}
        //                         />
        //                         <Badge
        //                             variant="outline"
        //                             className="flex h-4 w-4 items-center justify-center p-0 text-slate-400"
        //                         >
        //                             <STooltip content="RX">
        //                                 <ArrowDown className="h-3 w-3" />
        //                             </STooltip>
        //                         </Badge>
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="grid gap-1">
        //                 <div className="flex items-center gap-1 text-muted-foreground">
        //                     <HardDrive className="h-4 w-4" />
        //                     <span className="text-sm">Disk</span>
        //                 </div>
        //                 <div className="grid gap-1">
        //                     <div className="flex items-center gap-2">
        //                         <ValueWithUnitBlock
        //                             data={overview?.disk_io.read}
        //                         />
        //                         <Tracker
        //                             data={[
        //                                 // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //                                 // @ts-expect-error
        //                                 { color: 'slate-300', tooltip: 'Read' },
        //                             ]}
        //                             className="flex h-3 w-2 items-center justify-center"
        //                         />
        //                     </div>
        //                     <div className="flex items-center gap-2">
        //                         <ValueWithUnitBlock
        //                             data={overview?.disk_io.write}
        //                         />
        //                         <Tracker
        //                             data={[
        //                                 {
        //                                     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //                                     // @ts-expect-error
        //                                     color: 'slate-200',
        //                                     tooltip: 'Write',
        //                                 },
        //                             ]}
        //                             className="flex h-3 w-2 items-center justify-center"
        //                         />
        //                     </div>
        //                 </div>
        //             </div>
        //         </div>
        //     </CardContent>
        // </Card>
    )
}

const ValueWithUnitBlock: FC<
    HTMLAttributes<HTMLDivElement> & { data: FormatData }
> = ({ data, className }) => {
    const [value, unit] = useMemo(() => data ?? [], [data])
    return (
        <p className={cn('flex items-center gap-1', className)}>
            <span className="text-sm">{value ?? '0'}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
        </p>
    )
}

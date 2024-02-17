import { DiskDetail } from '@serverbee/types'
import { BarList, Color, Flex, Icon, Text, Title } from '@tremor/react'
import { HardDrive, Usb } from 'lucide-react'
import { useTheme } from 'next-themes'

import { formatToString, toGiB } from '@/lib/unit'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface Data {
    name: string
    value: number
}

interface Category {
    title: string
    value: number
    icon: any
    color: Color
    date: string
    data: Data[]
}

export type DiskDetailProp = {
    detail: DiskDetail
}

export default function DiskDetailBlock({ detail }: DiskDetailProp) {
    const { theme } = useTheme()

    let usedPercentage =
        toGiB(detail.total_space) === 0
            ? 0
            : Math.floor(
                  (1 -
                      toGiB(detail.available_space) /
                          toGiB(detail.total_space)) *
                      100
              )
    const freePercentage = 100 - usedPercentage

    const card: Category = {
        title: detail.device_name,
        value: usedPercentage,
        icon: HardDrive,
        color: 'slate',
        date: 'Today',
        data: [
            { name: 'Total', value: 100 },
            { name: 'Free', value: freePercentage },
            { name: 'Used', value: usedPercentage },
        ],
    }

    const dataFormatter = (num: number) => {
        if (num === 100) {
            return formatToString(detail.total_space)
        } else if (num === freePercentage) {
            return formatToString(detail.available_space)
        } else {
            return formatToString([
                (
                    (parseFloat(detail.total_space[0]) * usedPercentage) /
                    100
                ).toFixed(1),
                detail.total_space[1],
            ])
        }
    }

    return (
        <Card key={card.title} className="h-fit">
            <CardHeader className="space-y-2">
                <Flex justifyContent="start" className="space-x-4">
                    <Icon
                        variant="light"
                        icon={card.icon}
                        size="sm"
                        color={card.color}
                    />
                    <Title className="truncate">{card.title}</Title>
                </Flex>
                <Flex justifyContent="start" className="space-x-3 mt-3">
                    <Badge variant="outline">{detail.disk_type}</Badge>
                    {detail.is_removable && RemoveableView()}
                    {detail.file_system && FileSystemView(detail.file_system)}
                </Flex>
            </CardHeader>
            <CardContent>
                <Flex className="space-x-3">
                    <Progress value={card.value} className="col-span-2 my-2" />
                    <Title>{card.value}%</Title>
                </Flex>
                <Text className="mt-6 ml-1">Usage</Text>
                <BarList
                    key={card.title}
                    data={card.data}
                    className="mt-2"
                    // @ts-ignore
                    // https://github.com/tremorlabs/tremor/issues/612
                    color={theme === 'dark' ? `${card.color}-500 ` : card.color}
                    valueFormatter={dataFormatter}
                />
            </CardContent>
        </Card>
    )
}

const RemoveableView = () => {
    return (
        <Badge>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Usb size="15" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Removable Disk</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </Badge>
    )
}

const FileSystemView = (fileSystem: string) => {
    return (
        <Badge variant="secondary">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>{fileSystem}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>File System</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </Badge>
    )
}

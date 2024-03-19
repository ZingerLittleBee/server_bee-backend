import { useMemo } from 'react'
import { ArrowsExpandIcon } from '@heroicons/react/outline'
import { FormatData } from '@serverbee/types'
import {
    Bold,
    Col,
    DonutChart,
    Flex,
    Grid,
    Icon,
    List,
    ListItem,
    Text,
    Title,
} from '@tremor/react'
import { Network } from 'lucide-react'

import { formatToString, miBToMaxUnit, toMiB } from '@/lib/unit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

const orders: [string, number][] = [
    ['Received', 0],
    ['Transmitted', 2],
    ['Total Received', 1],
    ['Total Transmitted', 3],
    ['Packets Received', 4],
    ['Packets Transmitted', 6],
    ['Total Packets Received', 5],
    ['Total Packets Transmitted', 7],
    ['Errors Received', 8],
    ['Errors Transmitted', 10],
    ['Total Errors Received', 9],
    ['Total Errors Transmitted', 11],
]

const valueFormatter = (num: number) => formatToString(miBToMaxUnit(num))

export type NetworkDetailProps = {
    title: string
    packet: FormatData[]
    className?: string
}

export default function NetworkDetail({
    title,
    packet,
    className,
}: NetworkDetailProps) {
    const data = useMemo(() => {
        return orders.map(([name, order]) => ({
            name: name,
            value: toMiB(packet[order] ?? ['', '']),
            label: formatToString(packet[order]),
        }))
    }, [packet])

    const DataListView = ({
        limitNum = Number.MAX_SAFE_INTEGER,
    }: {
        limitNum?: number
    }) => (
        <>
            <Flex>
                <Text className="truncate">
                    <Bold>Asset</Bold>
                </Text>
                <Text>
                    <Bold>Traffic</Bold>
                </Text>
            </Flex>
            <List>
                {data
                    ?.filter((_, index) => index <= limitNum)
                    .map(({ name, label }, index) => (
                        <ListItem key={`${name}-${index}`}>
                            <Text className="truncate">{name}</Text>
                            <div>
                                <Flex
                                    justifyContent="end"
                                    className="space-x-4"
                                >
                                    <Text className="truncate">{label}</Text>
                                </Flex>
                            </div>
                        </ListItem>
                    ))}
            </List>
        </>
    )

    return (
        <Card className={className}>
            <CardHeader className="space-y-2">
                <Flex justifyContent="start" className="space-x-4">
                    <Icon
                        variant="light"
                        icon={Network}
                        size="sm"
                        color="slate"
                    />
                    <Title className="truncate">{title}</Title>
                </Flex>
            </CardHeader>
            <CardContent>
                <Grid numItemsLg={3} className="gap-x-14 gap-y-10">
                    <Flex>
                        <DonutChart
                            data={data}
                            category="value"
                            index="name"
                            variant="donut"
                            valueFormatter={valueFormatter}
                            noDataText="No data available"
                            showLabel={false}
                            className="h-32 stroke-none outline-none"
                        />
                    </Flex>
                    <Col numColSpan={1} numColSpanLg={2}>
                        <DataListView limitNum={3} />
                        <Flex justifyContent="center" className="mt-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <ArrowsExpandIcon className="mr-2 h-4 w-4" />
                                        Show more
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>{title}</DialogTitle>
                                        <DialogDescription>
                                            Network traffic
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DataListView />
                                </DialogContent>
                            </Dialog>
                        </Flex>
                    </Col>
                </Grid>
            </CardContent>
        </Card>
    )
}

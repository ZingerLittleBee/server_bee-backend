import { FC, useMemo } from 'react'
import { Bold, Flex, Text } from '@tremor/react'
import { unix } from 'dayjs'
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts'

import { Card } from '@/components/ui/card'
import { useStore } from '@/app/dashboard/store'

export function CpuActivity() {
    const { history } = useStore()

    const chartData = useMemo(() => {
        return history.cpu.map((item) => {
            return {
                name: unix(item.time).format('hh:mm:ss'),
                time: item.time,
                percent: item.value,
            }
        })
    }, [history.cpu])

    const CustomTooltip: FC<TooltipProps<string, number>> = ({
        active,
        payload,
    }) => {
        if (active) {
            const time = unix(payload?.[0]?.payload.time).format('hh:mm:ss')
            return (
                <Card className="min-w-[150px] py-1">
                    <Text className="mx-4">{time}</Text>
                    <div className="my-1 w-full border bg-muted"></div>
                    <div className="mx-4 flex flex-row items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-[#8884d8]"></div>
                        <Flex alignItems="center">
                            <Text>Usage</Text>
                            <Bold>{`${payload?.[0]?.value}`}%</Bold>
                        </Flex>
                    </div>
                </Card>
            )
        }
        return null
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart
                data={chartData}
                margin={{
                    top: 0,
                    right: 0,
                    left: -25,
                    bottom: 0,
                }}
                key={`cpu-${chartData.length}`}
                syncId="activityId"
            >
                <XAxis
                    dataKey="name"
                    interval="preserveStartEnd"
                    tick={{ fontSize: 14 }}
                />
                <YAxis
                    dataKey="percent"
                    domain={[0, 100]}
                    tick={{ fontSize: 14 }}
                    tickFormatter={(tick) =>
                        tick !== 0 ? tick.toString() : ''
                    }
                />
                <Tooltip
                    content={<CustomTooltip />}
                    isAnimationActive={false}
                />
                <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="percent"
                    stroke="#8884d8"
                    fill="#8884d8"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

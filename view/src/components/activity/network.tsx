import { FC, useMemo } from 'react'
import { useStore } from '@/store'
import { Bold, Flex, Text } from '@tremor/react'
import { unix } from 'dayjs'
import {
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis,
} from 'recharts'

import { formatToString, kiBToMaxUnit } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function NetworkActivity() {
    const { history } = useStore()

    const chartData = useMemo(() => {
        return history.network.map((item) => {
            return {
                name: unix(item.time).format('hh:mm:ss'),
                time: item.time,
                tx: parseInt(item.tx),
                rx: parseInt(item.rx),
            }
        })
    }, [history.network])

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart
                data={chartData}
                margin={{
                    top: 0,
                    right: 0,
                    left: -25,
                    bottom: 0,
                }}
                key={`network-${chartData.length}`}
                syncId="activityId"
            >
                <XAxis
                    dataKey="name"
                    interval="preserveStartEnd"
                    tick={{ fontSize: 14 }}
                />
                <YAxis domain={[0, 'dataMax']} tick={<CustomizedYAxisTick />} />
                <Tooltip
                    content={<CustomTooltip />}
                    isAnimationActive={false}
                />
                <Legend align="right" verticalAlign="top" />
                <Line
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="tx"
                    stroke="#8b5cf6"
                    dot={false}
                />
                <Line
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="rx"
                    stroke="#22c55e"
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

const CustomizedYAxisTick = ({ x, y, payload }: any) => {
    let [value, unit] = kiBToMaxUnit(payload.value, 0)

    if (payload.value === 0) {
        value = ''
        unit = ''
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                textAnchor="end"
                fill="#666"
                className="text-[14px]"
            >
                {value}
            </text>
            <text
                x={0}
                y={15}
                textAnchor="end"
                fill="#666"
                className="text-[10px] italic"
            >
                {unit}
            </text>
        </g>
    )
}

const CustomTooltip: FC<TooltipProps<string, number>> = ({
    active,
    payload,
}) => {
    if (active) {
        const time = payload?.[0].payload.name
        const tx = formatToString(kiBToMaxUnit(payload?.[0].value))
        const rx = formatToString(kiBToMaxUnit(payload?.[1].value))

        return (
            <Card className="min-w-[150px] py-1">
                <Text className="mx-4">{time}</Text>
                <div className="my-1 w-full border bg-muted"></div>
                <div className="mx-4 flex flex-row items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-[#8b5cf6]"></div>
                    <Flex alignItems="center">
                        <Text>TX</Text>
                        <Bold>{tx}</Bold>
                    </Flex>
                </div>
                <div className="mx-4 flex flex-row items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-[#22c55e]"></div>
                    <Flex alignItems="center">
                        <Text>RX</Text>
                        <Bold>{rx}</Bold>
                    </Flex>
                </div>
            </Card>
        )
    }
    return null
}

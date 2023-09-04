import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useStore} from "@/store";
import {computedMemoryUsagePercentage, formatToString, toGiB} from "@/lib/utils";
import {FC, useMemo} from "react";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps} from "recharts";
import {Card as TremorCard} from "@tremor/react";

const colors = [{
    name: 'Free',
    color: '#00C49F'
},
    {
        name: 'Used',
        color: '#f43f5e'
    },
    {
        name: 'Cached',
        color: '#64748b'
    }
]

export const MemoryWidget = () => {
    const {fusion} = useStore()

    const memoryUsage = fusion?.overview?.memory_usage

    const chartData = useMemo(() => {
        return [{
            key: 'free',
            name: "Free",
            value: toGiB(memoryUsage?.free),
            unit: memoryUsage?.free[1],
        }, {
            key: 'used',
            name: "Used",
            value: toGiB((memoryUsage?.used)),
            unit: memoryUsage?.used[1],
        }, {
            key: 'swap_total',
            name: "Cached",
            value: toGiB((memoryUsage?.swap_total)),
            unit: memoryUsage?.swap_total[1]
        }]
    }, [memoryUsage])

    const CustomTooltip: FC<TooltipProps<string, string>> = ({active, payload, label}) => {
        if (active && payload && payload.length) {
            let key: 'free' | 'used' | 'swap_total' = payload?.[0]?.payload.payload.key
            const color = colors.find(c => c.name === payload[0].name)?.color
            return (
                <TremorCard className="p-2 flex flex-row items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full" style={{
                        backgroundColor: color
                    }}></div>
                    <p className="text-[12px] text-muted-foreground">{payload[0].name}</p>
                    <p className="text-[12px]">{ formatToString(memoryUsage?.[key]) }</p>
                </TremorCard>
            );
        }
        return null;
    };


    return (
        <Card className="relative ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Memory
                </CardTitle>

                {/*<Badge>{formatToString(memoryUsage?.used)}</Badge>*/}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{`${computedMemoryUsagePercentage(memoryUsage)}%`}</div>
                <p className="text-xs text-muted-foreground">
                    {memoryUsage?.total ? formatToString(memoryUsage?.total) : 'N/A'} of total
                </p>
            </CardContent>
            <ResponsiveContainer
                className="absolute top-[50%] right-0 transform translate-y-[-50%]">
                <PieChart>
                    <Pie
                        dataKey="value"
                        data={chartData}
                        innerRadius={22}
                        outerRadius={32}
                        cx="85%"
                        cy="50%"
                        fill="#8884d8"
                        paddingAngle={3}
                        isAnimationActive={false}
                    >
                        {chartData.map((data, index) => (
                            <Cell key={data.key} className="outline-none cursor-pointer stroke-none"
                                  fill={colors.find(c => c.name === data.name)?.color}/>
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
            </ResponsiveContainer>
        </Card>
    )
}

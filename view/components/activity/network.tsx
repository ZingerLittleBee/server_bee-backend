"use client"

import {useStore} from "@/store";
import React, {FC, useMemo} from "react";
import {
    Legend, Line,
    LineChart,
    ResponsiveContainer,
    Tooltip, TooltipProps,
    XAxis,
    YAxis
} from "recharts";
import {unix} from 'dayjs'
import {formatToString, kiBToMaxUnit} from "@/lib/utils";
import {Card, Text} from "@tremor/react";

const CustomizedYAxisTick = ({x, y, payload}: any) => {
    let [value, unit] = kiBToMaxUnit(payload.value)

    if (payload.value === 0) {
        value = ''
        unit = ''
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} textAnchor="end" fill="#666" className="text-[14px]">
                {value}
            </text>
            <text x={0} y={15} textAnchor="end" fill="#666" className="text-[10px] italic">
                {unit}
            </text>
        </g>
    );
}

const CustomTooltip: FC<TooltipProps<string, number>> = ({active, payload, label}) => {
    if (active) {
        let time = payload?.[0].payload.name
        let tx = formatToString(kiBToMaxUnit(payload?.[0].value))
        let rx = formatToString(kiBToMaxUnit(payload?.[1].value))

        return (
            <Card className="min-w-[150px]" decoration="bottom" decorationColor="indigo">
                <Text>{time}</Text>
                <div className="flex flex-col justify-center items-start text-xl font-bold">
                    <p style={{color: '#22c55e'}}>
                        tx: {tx}
                    </p>
                    <p style={{color: '#8b5cf6'}}>
                        rx: {rx}
                    </p>
                </div>
            </Card>
        );
    }
    return null;
}

export function NetworkActivity() {
    const {history} = useStore()

    const chartData = useMemo(() => {
        return history.network.map(item => {
            return {
                name: unix(item.time).format('hh:mm:ss'),
                time: item.time,
                tx: parseInt(item.tx),
                rx: parseInt(item.rx),
            }
        })
    }, [history.network]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 5,
                }}
            >
                <XAxis dataKey="name" interval="preserveStartEnd" tick={{fontSize: 14}}/>
                <YAxis
                    domain={[0, 'dataMax']}
                    tick={<CustomizedYAxisTick/>}
                />
                <Tooltip content={<CustomTooltip/>}/>
                <Legend align="right" verticalAlign="top"/>
                <Line isAnimationActive={false} type="monotone" dataKey="tx" stroke="#8b5cf6" dot={false}/>
                <Line isAnimationActive={false} type="monotone" dataKey="rx" stroke="#22c55e" dot={false}/>
            </LineChart>
        </ResponsiveContainer>
    );
}

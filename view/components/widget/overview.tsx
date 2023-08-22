"use client"

import {useStore} from "@/store";
import React, {FC, useMemo} from "react";
import {Area, AreaChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis} from "recharts";
import {unix} from 'dayjs'
import {Text, Card} from "@tremor/react";

export function Overview() {
    const {history} = useStore()

    const chartData = useMemo(() => {
        return history.cpu.map((item, index) => {
            return {
                name: index,
                time: item.time,
                percent: item.value,
            }
        })
    }, [history.cpu]);

    const CustomTooltip: FC<TooltipProps<string, number>> = ({active, payload, label}) => {
        if (active) {
            let time = unix(payload?.[0].payload.time).format('hh:mm:ss')

            return (
                <Card className="min-w-[150px]" decoration="bottom" decorationColor="indigo">
                    <Text>{time}</Text>
                    <div className="text-2xl font-bold">{`${payload?.[0].value}`}%</div>
                </Card>
            );
        }
        return null;
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart
                data={chartData}
                margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 12,
                }}
            >
                <XAxis dataKey="name" label={{value: 'Seconds (s)', position: 'insideBottomRight', offset: -10}}/>
                <YAxis dataKey="percent" domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip/>}/>
                <Area isAnimationActive={false} type="monotone" dataKey="percent" stroke="#8884d8" fill="#8884d8"/>
            </AreaChart>
        </ResponsiveContainer>
    );
}

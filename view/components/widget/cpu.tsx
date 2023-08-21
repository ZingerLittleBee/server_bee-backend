import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useStore} from "@/store";
import {useEffect, useRef} from "react";
import {Badge, BadgeDelta} from "@tremor/react";


export default function CpuWidget() {
    const {fusion} = useStore()
    let cpu_usage = fusion?.overview?.cpu_usage

    const lastCpuUsageRef = useRef(cpu_usage);

    useEffect(() => {
        lastCpuUsageRef.current = cpu_usage;
    }, [cpu_usage]);

    let lastCpuUsage = lastCpuUsageRef.current;

    let currentCpuUsage = Number(cpu_usage ?? 0);
    let previousCpuUsage = Number(lastCpuUsage ?? 0);

    const diff = (currentCpuUsage - previousCpuUsage);


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    CPU Usage
                </CardTitle>
                <BadgeDelta size="xs" isIncreasePositive={false}
                            deltaType={diff > 0 ? 'increase' : diff === 0 ? 'moderateIncrease' : 'decrease'}>{`${Math.abs(diff).toFixed(1)}%`}</BadgeDelta>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{`${cpu_usage}%`}</div>
            </CardContent>
        </Card>
    )
}

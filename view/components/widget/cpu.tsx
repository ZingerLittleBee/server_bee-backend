import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useStore} from "@/store";
import {useEffect, useRef} from "react";
import {BadgeDelta} from "@tremor/react";


export default function CpuWidget() {
    const {fusion} = useStore()
    let cpuUsage = fusion?.overview?.cpu_usage

    const lastCpuUsageRef = useRef(cpuUsage);

    useEffect(() => {
        lastCpuUsageRef.current = cpuUsage;
    }, [cpuUsage]);

    let lastCpuUsage = lastCpuUsageRef.current;

    let currentCpuUsage = Number(cpuUsage ?? 0);
    let previousCpuUsage = Number(lastCpuUsage ?? 0);

    const diff = (currentCpuUsage - previousCpuUsage);


    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    CPU
                </CardTitle>
                <BadgeDelta size="xs" isIncreasePositive={false}
                            deltaType={diff > 0 ? 'increase' : diff === 0 ? 'moderateIncrease' : 'decrease'}>{`${Math.abs(diff).toFixed(1)}%`}</BadgeDelta>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{`${cpuUsage}%`}</div>
            </CardContent>
        </Card>
    )
}

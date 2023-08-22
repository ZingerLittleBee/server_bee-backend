import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useStore} from "@/store";
import {useEffect, useRef} from "react";
import {BadgeDelta} from "@tremor/react";
import {formatToString} from "@/lib/utils";


export default function CpuWidget() {
    const {fusion} = useStore()
    const cpuUsage = fusion?.overview?.cpu_usage
    const loadAverage = fusion?.overview?.load_avg

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
                <p className="text-xs text-muted-foreground">
                    1 min: {loadAverage?.[0]} | 5 min: {loadAverage?.[1]} | 15 min: {loadAverage?.[2]}
                </p>
            </CardContent>
        </Card>
    )
}

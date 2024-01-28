import { useEffect, useRef } from 'react'
import { BadgeDelta } from '@tremor/react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useFusion from '@/app/dashboard/hooks/useFusion'

export default function CpuWidget() {
    const fusion = useFusion()
    const cpuUsage = fusion?.overview?.cpu_usage
    const loadAverage = fusion?.overview?.load_avg

    const lastCpuUsageRef = useRef(cpuUsage)

    useEffect(() => {
        lastCpuUsageRef.current = cpuUsage
    }, [cpuUsage])

    const lastCpuUsage = lastCpuUsageRef.current

    const currentCpuUsage = Number(cpuUsage ?? 0)
    const previousCpuUsage = Number(lastCpuUsage ?? 0)

    const diff = currentCpuUsage - previousCpuUsage

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <BadgeDelta
                    className="h-2.5 p-2"
                    isIncreasePositive={false}
                    deltaType={
                        diff > 0
                            ? 'increase'
                            : diff === 0
                              ? 'moderateIncrease'
                              : 'decrease'
                    }
                >{`${Math.abs(diff).toFixed(1)}%`}</BadgeDelta>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {cpuUsage ? `${cpuUsage}%` : 'N/A'}
                </div>
                <p className="text-muted-foreground text-xs">
                    Load Average:{' '}
                    {loadAverage
                        ? `${loadAverage?.[0]} | ${loadAverage?.[1]} | ${loadAverage?.[2]}`
                        : 'N/A'}
                </p>
            </CardContent>
        </Card>
    )
}

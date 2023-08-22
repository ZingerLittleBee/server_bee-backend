import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useStore} from "@/store";
import {computedMemoryUsagePercentage, formatToString} from "@/lib/utils";
import {Badge} from "@tremor/react";

export const MemoryWidget = () => {
    const {fusion} = useStore()
    const memoryUsage = fusion?.overview?.memory_usage

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Memory
                </CardTitle>
                <Badge>{formatToString(memoryUsage?.used)}</Badge>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{`${computedMemoryUsagePercentage(memoryUsage)}%`}</div>
                <p className="text-xs text-muted-foreground">
                    {formatToString(memoryUsage?.total)} of total
                </p>
            </CardContent>
        </Card>
    )
}

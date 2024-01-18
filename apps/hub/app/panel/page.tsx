'use client'

import { Cpu, HardDrive, MemoryStick, Network } from 'lucide-react'

import { formatDataToString } from '@/lib/str'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useStore } from '@/app/dashboard/store'

export default function PanelPage() {
    const { fusion } = useStore()
    const overview = fusion?.overview

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Server1</CardTitle>
                <CardDescription>Server1 Descriptions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 gap-y-4">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Cpu className="h-4 w-4" />
                            <span>CPU</span>
                        </div>
                        <div>
                            <span>{`${overview?.cpu_usage} %`}</span>
                            <p className="flex items-end gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Load: {overview?.load_avg.join(' | ')}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MemoryStick className="h-4 w-4" />
                            <span>Mem</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="flex items-end gap-1">
                                <span>{overview?.memory_usage.used[0]}</span>
                                <span className="text-sm text-slate-500">
                                    {overview?.memory_usage.used[1]}
                                </span>
                            </p>
                            <p className="flex items-end gap-1">
                                <span className="text-xs text-muted-foreground">
                                    {overview?.memory_usage.total[0]}{' '}
                                    {overview?.memory_usage.total[1]} of total
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Network className="h-4 w-4" />
                            <span>Net</span>
                        </div>
                        <span>{`${overview?.cpu_usage}%`}</span>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <HardDrive className="h-4 w-4" />
                            <span>Disk</span>
                        </div>
                        <span>{`${overview?.cpu_usage}%`}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between"></CardFooter>
        </Card>
    )
}

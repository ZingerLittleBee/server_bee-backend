import { useStore } from '@/store'
import { Badge, Tracker } from '@tremor/react'
import { Sigma } from 'lucide-react'

import { formatToString } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DiskWidget() {
    const { fusion } = useStore()
    const disk = fusion?.overview?.disk_io

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk</CardTitle>
                <p className="text-sm text-muted-foreground">Total</p>
            </CardHeader>
            <CardContent>
                <div className="grid justify-between md:grid-cols-2">
                    <div className="flex flex-col items-start space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                            <Tracker
                                data={[{ color: 'emerald', tooltip: 'Read' }]}
                                className="flex h-3 w-2 items-center justify-center"
                            />
                            <Badge color="emerald">
                                {disk?.read
                                    ? formatToString(disk?.read)
                                    : 'N/A'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                            <Tracker
                                data={[{ color: 'rose', tooltip: 'Write' }]}
                                className="flex h-3 w-2 items-center justify-center"
                            />
                            <Badge color="rose">
                                {disk?.write
                                    ? formatToString(disk?.write)
                                    : 'N/A'}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                        <Badge icon={Sigma}>
                            {disk?.total_read
                                ? formatToString(disk?.total_read)
                                : 'N/A'}
                        </Badge>
                        <Badge icon={Sigma}>
                            {disk?.total_write
                                ? formatToString(disk?.total_write)
                                : 'N/A'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

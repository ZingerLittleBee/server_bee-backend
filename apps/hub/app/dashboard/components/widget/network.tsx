import { Badge } from '@tremor/react'
import { ArrowDownCircle, ArrowUpCircle, Sigma } from 'lucide-react'

import { formatToString } from '@/lib/unit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useFusion from '@/app/dashboard/hooks/useFusion'

export default function NetworkWidget() {
    const fusion = useFusion()
    const network = fusion?.overview?.network_io

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <p className="text-muted-foreground text-sm">Total</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 justify-between">
                    <div className="flex flex-col items-start space-y-1">
                        <Badge
                            color="violet"
                            className="dark:bg-violet-300"
                            icon={ArrowUpCircle}
                        >
                            {network?.tx ? formatToString(network?.tx) : 'N/A'}
                        </Badge>
                        <Badge
                            color="green"
                            className="dark:bg-green-300"
                            icon={ArrowDownCircle}
                        >
                            {network?.rx ? formatToString(network?.rx) : 'N/A'}
                        </Badge>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                        <Badge icon={Sigma}>
                            {network?.ttl_tx
                                ? formatToString(network?.ttl_tx)
                                : 'N/A'}
                        </Badge>
                        <Badge icon={Sigma}>
                            {network?.ttl_tx
                                ? formatToString(network?.ttl_rx)
                                : 'N/A'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useStore} from "@/store";
import {Badge} from "@tremor/react";
import {ArrowDownCircle, ArrowUpCircle, Sigma} from "lucide-react";
import {formatToString} from "@/lib/utils";


export default function NetworkWidget() {
    const {fusion} = useStore()
    const network = fusion?.overview?.network_io

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <p className="text-sm text-muted-foreground">Total</p>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 justify-between">
                    <div className="flex flex-col space-y-1 items-start">
                        <Badge color="lime" icon={ArrowUpCircle}>{formatToString(network?.tx)}</Badge>
                        <Badge color="sky" icon={ArrowDownCircle}>{formatToString(network?.rx)}</Badge>
                    </div>
                    <div className="flex flex-col space-y-1 items-end">
                        <Badge icon={Sigma}>{formatToString(network?.ttl_tx)}</Badge>
                        <Badge icon={Sigma}>{formatToString(network?.ttl_rx)}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

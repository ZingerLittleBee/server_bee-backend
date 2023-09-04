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
                        <Badge color="violet" icon={ArrowUpCircle}>{network?.tx ? formatToString(network?.tx) : 'N/A GB'}</Badge>
                        <Badge color="green" icon={ArrowDownCircle}>{network?.rx ? formatToString(network?.rx) : 'N/A GB'}</Badge>
                    </div>
                    <div className="flex flex-col space-y-1 items-end">
                        <Badge icon={Sigma}>{network?.ttl_tx ? formatToString(network?.ttl_tx) : 'N/A GB'}</Badge>
                        <Badge icon={Sigma}>{network?.ttl_tx ? formatToString(network?.ttl_rx) : 'N/A GB'}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

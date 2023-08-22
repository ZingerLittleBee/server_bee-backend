import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge, Tracker} from "@tremor/react";
import {ArrowDownCircle, ArrowUpCircle, Sigma} from "lucide-react";
import {formatToString} from "@/lib/utils";
import {useStore} from "@/store";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";

export function DiskWidget() {
    const {fusion} = useStore()
    const disk = fusion?.overview?.disk_io

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk</CardTitle>
                <p className="text-sm text-muted-foreground">Total</p>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 justify-between">
                    <div className="flex flex-col space-y-1 items-start">
                        <Badge color="emerald">
                            <div className="flex justify-center items-center space-x-2">
                                <Tracker data={[{color: "emerald", tooltip: "Read"}]}
                                         className="flex justify-center items-center w-2 h-3"/>
                                <p>{formatToString(disk?.read)}</p>
                            </div>
                        </Badge>
                        <Badge color="rose">
                            <div className="flex justify-center items-center space-x-2">
                                <Tracker data={[{color: "rose", tooltip: "Write"}]}
                                         className="flex justify-center items-center w-2 h-3"/>
                                <p>{formatToString(disk?.write)}</p>
                            </div>
                        </Badge>
                    </div>
                    <div className="flex flex-col space-y-1 items-end">
                        <Badge icon={Sigma}>{formatToString(disk?.total_read)}</Badge>
                        <Badge icon={Sigma}>{formatToString(disk?.total_write)}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

import {SimpleProcess} from "@/types/fusion";
import {useStore} from "@/store";
import {useMemo} from "react";
import {formatToString} from "@/lib/utils";
import {Virtuoso} from "react-virtuoso";
import {Card, CardContent} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {STooltip} from "@/components/s-tooltip";
import {Divider} from "@tremor/react";

export default function ProcessList() {
    const {fusion} = useStore()
    const process = fusion.process

    const processes = useMemo(() => {
        return process?.map<SimpleProcess>(p => ({
            pid: p.pid,
            name: p.name,
            cpu: p.cpu,
            memory: p.memory
        }))
    }, [process])

    return (
        <Card>
            <div className="pl-2 py-2 grid grid-cols-6 text-sm text-muted-foreground bg-muted">
                <p className=" col-span-1 truncate">PID</p>
                <p className="col-span-3 truncate">Name</p>
                <p className="col-span-1 truncate">CPU</p>
                <p className="col-span-1 truncate">Mem</p>
            </div>
            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-65px-16px-48px-40px-80px)] w-full rounded-md">
                    <Virtuoso
                        useWindowScroll
                        style={{height: '400px'}}
                        data={processes ?? []}
                        className="p-0"
                        itemContent={(_, process) => {
                            return (
                                <>
                                    <div className="pl-2 grid grid-cols-6 mt-2 text-[14px]">
                                        <p className="col-span-1 truncate">{process.pid}</p>
                                        <STooltip content={process.name}>
                                            <p className="col-span-3 truncate">
                                                {process.name}
                                            </p>
                                        </STooltip>
                                        <p className="col-span-1 truncate">{process.cpu}</p>
                                        <p className="col-span-1 truncate">{formatToString(process.memory)}</p>
                                    </div>
                                    <Divider className="my-1"/>

                                </>
                            )
                        }}
                    />
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

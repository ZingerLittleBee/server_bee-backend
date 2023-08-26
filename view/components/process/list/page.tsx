import {SimpleProcess} from "@/types/fusion";
import {columns} from "@/components/process/list/columns";
import {DataTable} from "@/components/process/list/data-table";
import {useStore} from "@/store";
import {useMemo} from "react";
import {formatToString} from "@/lib/utils";

const processes = Array.from({length: 50}).map(
    (_, i, a) => ({
        pid: Math.floor(Math.random() * 101),
        name: `p-${i}`,
        cpu: `${Math.floor(Math.random() * 101)}%`,
        memory: [Math.floor(Math.random() * 101), 'MB']
    } as unknown as SimpleProcess)
)

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
        <div className="">
            <DataTable columns={columns} data={processes ?? []}/>
        </div>
    )
}

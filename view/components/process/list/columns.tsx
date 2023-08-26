"use client"

import {ColumnDef} from "@tanstack/react-table"
import {FormatData, SimpleProcess} from "@/types/fusion";
import {formatToString} from "@/lib/utils";
import {STooltip} from "@/components/s-tooltip";

export const columns: ColumnDef<SimpleProcess>[] = [
    {
        accessorKey: "pid",
        header: "PID",
        cell: ({row}) => {
            const pid = row.getValue<string>("pid")
            return <STooltip content={pid}>
                <div className="max-w-[50px] truncate">{pid}</div>
            </STooltip>
        }
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({row}) => {
            const name = row.getValue<string>("name")
            return <STooltip content={name}>
                <div className="max-w-[200px] truncate">{name}</div>
            </STooltip>
        }
    },
    {
        accessorKey: "cpu",
        header: "CPU",
        cell: ({row}) => {
            return <div className="max-w-[100px] truncate">{row.getValue("cpu")}</div>
        }
    },
    {
        accessorKey: "memory",
        header: "MEM",
        cell: ({row}) => {
            const mem = row.getValue<FormatData>("memory")
            return <div className="max-w-[150px] truncate">{formatToString(mem)}</div>
        }
    },
]

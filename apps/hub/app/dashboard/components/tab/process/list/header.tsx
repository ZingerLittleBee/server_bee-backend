'use client'

import { useState } from 'react'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'

export function ProcessListHeader() {
    const [sort, setSort] = useState(new Array(8).fill(false))

    return (
        <div className="bg-muted text-muted-foreground grid grid-cols-6 py-2 pl-2 text-sm">
            <p className="col-span-1 flex cursor-pointer items-center space-x-1 truncate">
                <span className="select-none">PID</span>
                {sort[0] && <ArrowDownWideNarrow size={16} />}
                {sort[1] && <ArrowUpNarrowWide size={16} />}
            </p>
            <p className="col-span-3 flex cursor-pointer items-center space-x-1 truncate">
                <span className="select-none">Name</span>
                {sort[2] && <ArrowDownWideNarrow size={16} />}
                {sort[3] && <ArrowUpNarrowWide size={16} />}
            </p>
            <p className="col-span-1 flex cursor-pointer items-center space-x-1 truncate">
                <span className="select-none">CPU</span>
                {sort[4] && <ArrowDownWideNarrow size={16} />}
                {sort[5] && <ArrowUpNarrowWide size={16} />}
            </p>
            <p className="col-span-1 flex cursor-pointer items-center space-x-1 truncate">
                <span className="select-none">Mem</span>
                {sort[6] && <ArrowDownWideNarrow size={16} />}
                {sort[7] && <ArrowUpNarrowWide size={16} />}
            </p>
        </div>
    )
}

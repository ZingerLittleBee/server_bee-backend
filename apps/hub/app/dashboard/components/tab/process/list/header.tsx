import { useState } from 'react'
import { useDebounceFn } from 'ahooks'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'

import useWebsocket from '@/hooks/useWebsocket'

export function ProcessListHeader() {
    const { sortUp, sortDown } = useWebsocket()

    const [sort, setSort] = useState<boolean[]>(new Array(8).fill(false))

    const sortHandler = (sortKey: string, [up, down]: [number, number]) => {
        if (sort[up]) {
            setSort(sort.map((_, i) => i === down))
            sortUp(sortKey)
        } else if (sort[down]) {
            setSort(sort.map((_, i) => i === up))
            sortDown(sortKey)
        } else {
            setSort(sort.map((_, i) => i === down))
            sortUp(sortKey)
        }
    }

    const { run: sortRun } = useDebounceFn<typeof sortHandler>(sortHandler, {
        wait: 300,
    })

    return (
        <div className="grid grid-cols-6 bg-muted py-2 pl-2 text-sm text-muted-foreground">
            <p
                className="col-span-1 flex cursor-pointer items-center space-x-1 truncate"
                onClick={() => sortRun('pid', [0, 1])}
            >
                <span className="select-none">PID</span>
                {sort[0] && <ArrowDownWideNarrow size={16} />}
                {sort[1] && <ArrowUpNarrowWide size={16} />}
            </p>
            <p
                className="col-span-3 flex cursor-pointer items-center space-x-1 truncate"
                onClick={() => sortRun('name', [2, 3])}
            >
                <span className="select-none">Name</span>
                {sort[2] && <ArrowDownWideNarrow size={16} />}
                {sort[3] && <ArrowUpNarrowWide size={16} />}
            </p>
            <p
                className="col-span-1 flex cursor-pointer items-center space-x-1 truncate"
                onClick={() => sortRun('cpu', [4, 5])}
            >
                <span className="select-none">CPU</span>
                {sort[4] && <ArrowDownWideNarrow size={16} />}
                {sort[5] && <ArrowUpNarrowWide size={16} />}
            </p>
            <p
                className="col-span-1 flex cursor-pointer items-center space-x-1 truncate"
                onClick={() => sortRun('mem', [6, 7])}
            >
                <span className="select-none">Mem</span>
                {sort[6] && <ArrowDownWideNarrow size={16} />}
                {sort[7] && <ArrowUpNarrowWide size={16} />}
            </p>
        </div>
    )
}

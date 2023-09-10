import { useState } from "react"
import { useDebounceFn } from "ahooks"

import useWebsocket from "@/hooks/useWebsocket.ts"
import { Icons } from "@/components/icons.tsx"

export function ProcessListHeader() {
  const { sortUp, sortDown } = useWebsocket()

  const [sort, setSort] = useState(new Array(8).fill(false))

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
    <div className="pl-2 py-2 grid grid-cols-6 text-sm text-muted-foreground bg-muted">
      <p
        className="flex col-span-1 truncate items-center space-x-1 cursor-pointer"
        onClick={() => sortRun("pid", [0, 1])}
      >
        <span className="select-none">PID</span>
        {sort[0] && <Icons.descende size={16} />}
        {sort[1] && <Icons.ascende size={16} />}
      </p>
      <p
        className="flex col-span-3 truncate items-center space-x-1 cursor-pointer"
        onClick={() => sortRun("name", [2, 3])}
      >
        <span className="select-none">Name</span>
        {sort[2] && <Icons.descende size={16} />}
        {sort[3] && <Icons.ascende size={16} />}
      </p>
      <p
        className="flex col-span-1 truncate items-center space-x-1 cursor-pointer"
        onClick={() => sortRun("cpu", [4, 5])}
      >
        <span className="select-none">CPU</span>
        {sort[4] && <Icons.descende size={16} />}
        {sort[5] && <Icons.ascende size={16} />}
      </p>
      <p
        className="flex col-span-1 truncate items-center space-x-1 cursor-pointer"
        onClick={() => sortRun("mem", [6, 7])}
      >
        <span className="select-none">Mem</span>
        {sort[6] && <Icons.descende size={16} />}
        {sort[7] && <Icons.ascende size={16} />}
      </p>
    </div>
  )
}

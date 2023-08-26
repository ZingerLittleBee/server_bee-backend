import {useState} from "react";
import useWebsocket from "@/hooks/useWebsocket";
import {Icons} from "@/components/icons";

export function ProcessListHeader() {

    const {sortUp, sortDown} = useWebsocket()

    const [sort, setSort] = useState(new Array(8).fill(false))

    return (
        <div className="pl-2 py-2 grid grid-cols-6 text-sm text-muted-foreground bg-muted">
            <p className="flex col-span-1 truncate items-center space-x-1 cursor-pointer" onClick={() => {
                if (sort[0]) {
                    setSort(sort.map((_, i) => i === 1))
                    sortUp('pid')
                } else if (sort[1]) {
                    setSort(sort.map((_, i) => i === 0))
                    sortDown('pid')
                } else {
                    setSort(sort.map((_, i) => i === 1))
                    sortDown('pid')
                }
            }}>
                <span className="select-none">PID</span>
                {sort[0] && <Icons.descende size={16}/>}
                {sort[1] && <Icons.ascende size={16}/>}
            </p>
            <p className="flex col-span-3 truncate items-center space-x-1 cursor-pointer" onClick={() => {
                if (sort[2]) {
                    setSort(sort.map((_, i) => i === 3))
                    sortUp('name')
                } else if (sort[3]) {
                    setSort(sort.map((_, i) => i === 2))
                    sortDown('name')
                } else {
                    setSort(sort.map((_, i) => i === 3))
                    sortDown('name')
                }
            }}>
                <span className="select-none">Name</span>
                {sort[2] && <Icons.descende size={16}/>}
                {sort[3] && <Icons.ascende size={16}/>}
            </p>
            <p className="flex col-span-1 truncate items-center space-x-1 cursor-pointer" onClick={() => {
                if (sort[4]) {
                    setSort(sort.map((_, i) => i === 5))
                    sortUp('cpu')
                } else if (sort[5]) {
                    setSort(sort.map((_, i) => i === 4))
                    sortDown('cpu')
                } else {
                    setSort(sort.map((_, i) => i === 5))
                    sortDown('cpu')
                }
            }}>
                <span className="select-none">CPU</span>
                {sort[4] && <Icons.descende size={16}/>}
                {sort[5] && <Icons.ascende size={16}/>}
            </p>
            <p className="flex col-span-1 truncate items-center space-x-1 cursor-pointer" onClick={() => {
                if (sort[6]) {
                    setSort(sort.map((_, i) => i === 7))
                    sortUp('mem')
                } else if (sort[7]) {
                    setSort(sort.map((_, i) => i === 6))
                    sortDown('mem')
                } else {
                    setSort(sort.map((_, i) => i === 7))
                    sortDown('mem')
                }
            }}>
                <span className="select-none">Mem</span>
                {sort[6] && <Icons.descende size={16}/>}
                {sort[7] && <Icons.ascende size={16}/>}
            </p>
        </div>
    )
}

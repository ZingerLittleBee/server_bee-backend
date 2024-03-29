import { useMemo } from 'react'
import { useStore } from '@/store'
import { clsx } from 'clsx'
import { Virtuoso } from 'react-virtuoso'

import { SimpleProcess } from '@/types/fusion.ts'
import { formatToString } from '@/lib/utils.ts'
import useWebsocket from '@/hooks/useWebsocket.ts'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { STooltip } from '@/components/s-tooltip.tsx'
import { ProcessListHeader } from '@/components/tab/process/list/header.tsx'

export default function ProcessList() {
    const { fusion } = useStore()
    const { requestProcess } = useWebsocket()
    const process = fusion.process

    const processes = useMemo(() => {
        return process?.map<SimpleProcess>((p) => ({
            pid: p.pid,
            name: p.name,
            cpu: p.cpu,
            memory: p.memory,
        }))
    }, [process])

    const currentProcessId = useMemo(() => {
        return fusion.current_process?.pid
    }, [fusion.current_process])

    return (
        <Card>
            <ProcessListHeader />
            <CardContent className="p-0">
                <ScrollArea
                    className="w-full"
                    viewportClassName="max-h-[629px]"
                >
                    <Virtuoso
                        useWindowScroll
                        style={{ height: '629px' }}
                        data={processes ?? []}
                        className="rounded-none p-0"
                        itemContent={(_, process) => {
                            return (
                                <div
                                    className={clsx('py-1 border-b', {
                                        'bg-slate-300 dark:bg-slate-700':
                                            process.pid === currentProcessId,
                                    })}
                                >
                                    <div className="grid grid-cols-6 pl-2 text-[14px]">
                                        <p
                                            className="col-span-1 cursor-pointer truncate"
                                            onClick={() =>
                                                process.pid &&
                                                requestProcess(process.pid)
                                            }
                                        >
                                            {process.pid}
                                        </p>
                                        <STooltip content={process.name}>
                                            <p className="col-span-3 truncate">
                                                {process.name}
                                            </p>
                                        </STooltip>
                                        <p className="col-span-1 truncate">
                                            {process.cpu}
                                        </p>
                                        <p className="col-span-1 truncate">
                                            {formatToString(process.memory)}
                                        </p>
                                    </div>
                                </div>
                            )
                        }}
                    />
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

import { useMemo } from "react"
import { useStore } from "@/store"
import { clsx } from "clsx"
import { Virtuoso } from "react-virtuoso"

import { SimpleProcess } from "@/types/fusion"
import { formatToString } from "@/lib/utils"
import useWebsocket from "@/hooks/useWebsocket"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProcessListHeader } from "@/components/process/list/header"
import { STooltip } from "@/components/s-tooltip"

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
        <ScrollArea className="h-[calc(100vh-65px-1rem-36px-40px-16px-36px-20px)] w-full">
          <Virtuoso
            useWindowScroll
            style={{ height: "400px" }}
            data={processes ?? []}
            className="rounded-none p-0"
            itemContent={(_, process) => {
              return (
                <div
                  className={clsx("py-1 border-b", {
                    "bg-slate-300 dark:bg-slate-700":
                      process.pid === currentProcessId,
                  })}
                >
                  <div className="grid grid-cols-6 pl-2 text-[14px]">
                    <p
                      className="col-span-1 truncate cursor-pointer"
                      onClick={() => process.pid && requestProcess(process.pid)}
                    >
                      {process.pid}
                    </p>
                    <STooltip content={process.name}>
                      <p className="col-span-3 truncate">{process.name}</p>
                    </STooltip>
                    <p className="col-span-1 truncate">{process.cpu}</p>
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

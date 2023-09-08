import { useStore } from "@/store"
import { Badge, Tracker } from "@tremor/react"
import { Sigma } from "lucide-react"

import { formatToString } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DiskWidget() {
  const { fusion } = useStore()
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
            <div className="flex justify-center items-center space-x-2">
              <Tracker
                data={[{ color: "emerald", tooltip: "Read" }]}
                className="flex justify-center items-center w-2 h-3"
              />
              <Badge color="emerald">
                {disk?.read ? formatToString(disk?.read) : "N/A GB"}
              </Badge>
            </div>
            <div className="flex justify-center items-center space-x-2">
              <Tracker
                data={[{ color: "rose", tooltip: "Write" }]}
                className="flex justify-center items-center w-2 h-3"
              />
              <Badge color="rose">
                {disk?.write ? formatToString(disk?.write) : "N/A GB"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col space-y-1 items-end">
            <Badge icon={Sigma}>
              {disk?.total_read ? formatToString(disk?.total_read) : "N/A GB"}
            </Badge>
            <Badge icon={Sigma}>
              {disk?.total_write ? formatToString(disk?.total_write) : "N/A GB"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

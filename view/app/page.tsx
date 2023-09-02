"use client"

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import useWebsocket from "@/hooks/useWebsocket";
import {useStore} from "@/store";
import CpuWidget from "@/components/widget/cpu";
import {MemoryWidget} from "@/components/widget/memory";
import NetworkWidget from "@/components/widget/network";
import {DiskWidget} from "@/components/widget/disk";
import {CpuActivity} from "@/components/activity/cpu";
import {NetworkActivity} from "@/components/activity/network";
import {OsWidget} from "@/components/widget/os";
import ProcessDetail from "@/components/process/detail";
import ProcessList from "@/components/process/list/page";
import {Badge, Color} from "@tremor/react";
import {ElementType, useMemo} from "react";
import {Cable, HelpCircle, PlugZap, Unplug, Wifi} from "lucide-react";
import WithAuth from "@/components/with_auth";
import {useSettings} from "@/hooks/useSettings";

function DashboardPage() {

  const {requestProcess, status} = useWebsocket()

  const {fusion} = useStore()

  const os = fusion?.os

  const statusText: [ElementType, Color, string] = useMemo(() => {
    switch (status) {
      case WebSocket.CONNECTING:
        return [PlugZap, 'teal', 'Connecting']
      case WebSocket.OPEN:
        return [Wifi, 'green', 'Connected']
      case WebSocket.CLOSING:
        return [Cable, 'amber', 'Closing']
      case WebSocket.CLOSED:
        return [Unplug, 'rose', 'Disconnected']
      default:
        return [HelpCircle, 'slate', 'Unknown']
    }
  }, [status])

  return <>
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">{os?.name}</h2>
      <Badge size="md" icon={statusText[0]} color={statusText[1]}>{statusText[2]}</Badge>
    </div>
    <Tabs defaultValue="overview" className="space-y-4"
          onValueChange={value => value === 'process' && requestProcess()}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="process">
          Process
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <OsWidget/>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CpuWidget/>
          <MemoryWidget/>
          <NetworkWidget/>
          <DiskWidget/>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>CPU Activity</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <CpuActivity/>
            </CardContent>
          </Card>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Network Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkActivity/>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="process" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-3">{<ProcessList/>}</div>
          <div className="col-span-4">{<ProcessDetail/>}</div>
        </div>
      </TabsContent>
    </Tabs>
  </>
}

export default WithAuth(DashboardPage)

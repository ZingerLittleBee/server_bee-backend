"use client"

import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import useWebsocket from "@/hooks/useWebsocket";
import {useToken} from "@/hooks/useToken";
import {useStore} from "@/store";
import CpuWidget from "@/components/widget/cpu";
import {MemoryWidget} from "@/components/widget/memory";
import NetworkWidget from "@/components/widget/network";
import {DiskWidget} from "@/components/widget/disk";
import {CpuActivity} from "@/components/activity/cpu";
import {NetworkActivity} from "@/components/activity/network";
import {OsWidget} from "@/components/widget/os";
import ProcessDetail from "@/components/process/detail";
import ProcessList from "@/components/process/list";

export default function DashboardPage() {

  const token = useToken()

  const {requestProcess} = useWebsocket()

  const {fusion} = useStore()

  const os = fusion?.os

  return (
      <>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{os?.name}</h2>
          <div className="flex items-center space-x-2">
            <Button>{token.communicationToken}</Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4"
              onValueChange={value => value === 'process' && requestProcess()}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="process">
              Process
            </TabsTrigger>
            <TabsTrigger value="reports" disabled>
              Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
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
  )
}

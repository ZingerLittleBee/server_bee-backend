"use client"

import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Overview} from "@/components/overview";
import {RecentSales} from "@/components/recent-sales";
import useWebsocket from "@/hooks/useWebsocket";
import {useToken} from "@/hooks/useToken";
import {useStore} from "@/store";
import CpuWidget from "@/components/widget/cpu";
import {MemoryWidget} from "@/components/widget/memory";
import NetworkWidget from "@/components/widget/network";
import {DiskWidget} from "@/components/widget/disk";

export default function DashboardPage() {

  const token = useToken()

  const {sendMessage} = useWebsocket()

  const {fusion} = useStore()

  const info = fusion?.os?.name
  return (
      <>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{info}</h2>
          <div className="flex items-center space-x-2">
            <Button>{token.communicationToken}</Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" disabled>
              Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <CpuWidget/>
              <MemoryWidget/>
              <NetworkWidget/>
              <DiskWidget/>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview/>
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales/>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </>
  )
}

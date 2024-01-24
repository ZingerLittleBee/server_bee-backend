'use client'

import { useBoundStore } from '@/store'

import useServerList from '@/hooks/useServerList'
import PanelCard from '@/app/panel/components/card'

export default function PanelPage() {
    const records = useBoundStore.use.records()
    const networkHistory = useBoundStore.use.networkHistories()

    const serverList = useServerList()

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {records?.map(({ fusion, server_id, time }) => (
                <PanelCard
                    key={server_id}
                    fusion={fusion}
                    name={
                        serverList?.find((s) => s.id === server_id)?.name ?? ''
                    }
                    server_id={server_id}
                    time={time}
                    networkHistory={
                        networkHistory.find((h) => h.serverId === server_id)
                            ?.networks ?? []
                    }
                    className="w-full"
                />
            ))}
        </div>
    )
}

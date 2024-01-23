'use client'

import { useBoundStore } from '@/store'

import PanelCard from '@/app/panel/components/card'

export default function PanelPage() {
    const records = useBoundStore.use.records()
    const networkHistory = useBoundStore.use.networkHistories()

    return records?.map(({ fusion, server_id, time }) => (
        <PanelCard
            key={server_id}
            fusion={fusion}
            server_id={server_id}
            time={time}
            networkHistory={
                networkHistory.find((h) => h.serverId === server_id)
                    ?.networks ?? []
            }
        />
    ))
}

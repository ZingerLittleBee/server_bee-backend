'use client'

import { useMemo } from 'react'
import { useBoundStore } from '@/store'

import useServerList from '@/hooks/useServerList'
import PanelCard, { PanelCardSkeleton } from '@/app/panel/components/card'

export default function PanelPage() {
    const records = useBoundStore.use.records()
    const networkHistory = useBoundStore.use.networkHistories()

    const serverList = useServerList()

    const servers = useMemo(() => {
        return (
            serverList?.map((s) => {
                return {
                    ...s,
                    record: records?.find((r) => r.server_id === s.id),
                    networkHistory:
                        networkHistory.find((h) => h.serverId === s.id)
                            ?.networks ?? [],
                }
            }) ?? []
        )
    }, [networkHistory, records, serverList])

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {servers?.map(({ id, name, record, networkHistory }) =>
                record ? (
                    <PanelCard
                        key={id}
                        id={id}
                        name={name}
                        record={record}
                        networkHistory={networkHistory}
                        className="w-full"
                    />
                ) : (
                    <PanelCardSkeleton key={id} name={name} />
                )
            )}
        </div>
    )
}

import { useMemo } from 'react'
import { StatusEnum } from '@/constant/enum/status'
import { useBoundStore } from '@/store'
import { api } from '@/trpc/react'

export default function useServerList() {
    const { data: serverList } = api.server.list.useQuery()
    const records = useBoundStore.use.records()
    const networkHistory = useBoundStore.use.networkHistories()

    const servers = useMemo(() => {
        return (
            serverList?.map((s) => {
                const record = records?.find((r) => r.server_id === s.id)
                const time = record?.time
                const status = !time
                    ? StatusEnum.Pending
                    : Math.floor(Date.now() / 1000) - time > 60
                      ? StatusEnum.Offline
                      : StatusEnum.Online
                return {
                    ...s,
                    record,
                    networkHistory:
                        networkHistory.find((h) => h.serverId === s.id)
                            ?.networks ?? [],
                    status: status,
                }
            }) ?? []
        )
    }, [networkHistory, records, serverList])

    return servers ?? []
}

import { useMemo } from 'react'
import { useBoundStore } from '@/store'

export default function useFusion() {
    const records = useBoundStore.use.records()
    const currentServerId = useBoundStore.use.currentServerId()

    return useMemo(
        () => records.find((r) => r.server_id === currentServerId)?.fusion,
        [currentServerId, records]
    )
}

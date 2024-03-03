import { useCallback, useEffect } from 'react'
import { useBoundStore } from '@/store'
import { type ProcessSortKey } from '@serverbee/types'

import { useStore } from '@/app/dashboard/store'

const useWebsocket = () => {
    const { ws } = useStore()
    const currentServerId = useBoundStore.use.currentServerId()

    const sendMessage = useCallback(
        (message: string) => {
            if (ws?.instance?.readyState === WebSocket.OPEN) {
                ws.instance?.send(message)
            }
        },
        [ws]
    )

    const requestDetail = useCallback(
        (id: string) => sendMessage(`/detail ${id}`),
        [sendMessage]
    )

    useEffect(() => {
        currentServerId && requestDetail(currentServerId)
    }, [currentServerId, requestDetail])

    const requestOverview = () => sendMessage(`/overview`)

    const requestProcess = (pid?: string) =>
        sendMessage(pid ? `/process ${pid}` : '/process')

    const sortUp = (key: ProcessSortKey) =>
        sendMessage(`/up ${key} ${currentServerId}`)
    const sortDown = (key: ProcessSortKey) =>
        sendMessage(`/down ${key} ${currentServerId}`)

    return {
        requestOverview,
        requestDetail,
        requestProcess,
        sortUp,
        sortDown,
        status: ws?.status ?? ws?.instance?.readyState,
    }
}

export default useWebsocket

import { useCallback, useEffect } from 'react'
import { useBoundStore } from '@/store'
import { type processSortKey } from '@serverbee/types'

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

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const sortUp = (key: processSortKey) => sendMessage(`/up ${key}`)
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const sortDown = (key: processSortKey) => sendMessage(`/down ${key}`)

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

import { type processSortKey } from '@serverbee/types'

import { useStore } from '@/app/dashboard/store'

const useWebsocket = () => {
    const { ws } = useStore()

    const sendMessage = (message: string) => {
        ws.instance?.send(message)
    }

    const requestMore = () => {
        sendMessage('/more')
    }

    const requestLess = () => sendMessage('/less')

    const requestProcess = (pid?: string) =>
        sendMessage(pid ? `/process ${pid}` : '/process')

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const sortUp = (key: processSortKey) => sendMessage(`/up ${key}`)
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const sortDown = (key: processSortKey) => sendMessage(`/down ${key}`)

    return {
        requestMore,
        requestLess,
        requestProcess,
        sortUp,
        sortDown,
        status: ws?.status ?? ws?.instance?.readyState,
    }
}

export default useWebsocket

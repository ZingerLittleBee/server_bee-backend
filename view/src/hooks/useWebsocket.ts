import { useStore } from '@/store'

import { processSortKey } from '@/types/fusion'

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

    const sortUp = (key: processSortKey) => sendMessage(`/up ${key}`)
    const sortDown = (key: processSortKey) => sendMessage(`/down ${key}`)

    return {
        requestMore,
        requestLess,
        requestProcess,
        sortUp,
        sortDown,
        status: ws.status ?? ws.instance?.readyState,
    }
}

export default useWebsocket

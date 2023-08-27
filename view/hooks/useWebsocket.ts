import {useEffect} from "react";
import {useToken} from "@/hooks/useToken";
import {Fusion, processSortKey} from "@/types/fusion";
import {useStore} from "@/store";
import {kSetFusion} from "@/store/fusion";
import {kHistoryAdd} from "@/store/history";
import {kSetWs} from "@/store/ws";

const useWebsocket = () => {

    const {communicationToken} = useToken()
    const {ws, wsDispatch} = useStore()
    const {fusionDispatch, historyDispatch} = useStore()


    useEffect(() => {
        if (communicationToken) {
            let instance: WebSocket
            if (!ws.instance || (ws.instance.readyState !== WebSocket.OPEN && ws.instance.readyState !== WebSocket.CONNECTING)) {
                const loc = window.location;
                let protocol = 'ws://';
                if (loc.protocol === 'https:') {
                    protocol = 'wss://';
                }
                instance = new WebSocket(`${protocol}${loc.host}/ws?token=${communicationToken}`)
                wsDispatch({
                    type: kSetWs,
                    payload: instance
                })
            } else {
                instance = ws.instance
            }


            instance.onopen = () => {
                console.log('Websocket Connected');
                instance.send('/more')
            };
            instance.onmessage = (e) => {
                const fusion = JSON.parse(e.data) as Fusion
                fusionDispatch({type: kSetFusion, payload: fusion})
                historyDispatch({type: kHistoryAdd, payload: fusion.overview})
            };
            instance.onclose = () => {
                console.log('Disconnected');
            };
            instance.onerror = (e) => {
                console.log('Websocket Error', e);
            };
            // return () => instance.close();
        }
    }, [communicationToken])

    const sendMessage = (message: string) => {
        ws.instance?.send(message)
    }

    const requestMore = () => {
        sendMessage('/more')
    }

    const requestLess = () => sendMessage('/less')

    const requestProcess = (pid?: string) => sendMessage(pid ? `/process ${pid}` : '/process')

    const sortUp = (key: processSortKey) => sendMessage(`/up ${key}`)
    const sortDown = (key: processSortKey) => sendMessage(`/down ${key}`)

    const status = () => ws.instance?.readyState

    return {
        requestMore,
        requestLess,
        requestProcess,
        sortUp,
        sortDown,
        status
    };
}

export default useWebsocket

import {useEffect, useRef} from "react";
import {useToken} from "@/hooks/useToken";
import {Fusion, SimpleProcessKey} from "@/types/fusion";
import {useStore} from "@/store";
import {kSetFusion} from "@/store/fusion";
import {kHistoryAdd} from "@/store/history";

const useWebsocket = () => {

    const {communicationToken} = useToken()
    const {fusionDispatch, historyDispatch} = useStore()

    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (communicationToken) {
            const loc = window.location;
            let protocol = 'ws://';
            if (loc.protocol === 'https:') {
                protocol = 'wss://';
            }

            if (!wsRef.current) {
                wsRef.current = new WebSocket(`${protocol}${loc.host}/ws?token=${communicationToken}`);
            }

            const ws = wsRef.current;

            ws.onopen = () => {
                console.log('Websocket Connected');
                ws.send('/more')
            };
            ws.onmessage = (e) => {
                const fusion = JSON.parse(e.data) as Fusion
                fusionDispatch({type: kSetFusion, payload: fusion})
                historyDispatch({type: kHistoryAdd, payload: fusion.overview})
            };
            ws.onclose = () => {
                console.log('Disconnected');
            };
            ws.onerror = (e) => {
                console.log('Websocket Error', e);
            };
            return () => ws.close();
        }
    }, [communicationToken])

    const sendMessage = (message: string) => {
        if (wsRef.current) {
            wsRef.current.send(message);
        }
    }

    const requestMore = () => {
        sendMessage('/more')
    }

    const requestLess = () => sendMessage('/less')

    const requestProcess = (pid?: string) => sendMessage(pid ? `/process ${pid}` : '/process')

    const sortUp = (key: SimpleProcessKey) => sendMessage(`/up ${key}`)
    const sortDown = (key: SimpleProcessKey) => sendMessage(`/down ${key}`)

    return {
        requestMore,
        requestLess,
        requestProcess,
        sortUp,
        sortDown
    };
}

export default useWebsocket

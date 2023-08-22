import {useEffect} from "react";
import {useToken} from "@/hooks/useToken";
import {Fusion} from "@/types/fusion";
import {useStore} from "@/store";
import {kSetFusion} from "@/store/fusion";
import {kHistoryAdd} from "@/store/history";

const useWebsocket = () => {

    const {communicationToken} = useToken()
    const {fusionDispatch, historyDispatch} = useStore()

    let ws: WebSocket;
    useEffect(() => {
        if (communicationToken) {
            const loc = window.location;
            let protocol = 'ws://';
            if (loc.protocol === 'https:') {
                protocol = 'wss://';
            }
            ws = new WebSocket(`${protocol}${loc.host}/ws?token=${communicationToken}`);
            ws.onopen = () => {
                console.log('Websocket Connected');
                ws.send('/more')
            };
            ws.onmessage = (e) => {
                console.log(e.data);
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
        ws.send(message);
    }

    return {sendMessage};
}

export default useWebsocket

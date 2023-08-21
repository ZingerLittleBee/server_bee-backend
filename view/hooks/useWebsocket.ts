import {useEffect} from "react";
import {useToken} from "@/hooks/useToken";

const useWebsocket = () => {

    const {communicationToken} = useToken()

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
                console.log('connected');
            };
            ws.onmessage = (e) => {
                console.log(e.data);
            };
            ws.onclose = () => {
                console.log('disconnected');
            };
            ws.onerror = (e) => {
                console.log('websocket error', e);
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

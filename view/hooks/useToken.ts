import {useEffect} from "react";
import {getToken} from "@/requests/token";
import {useStore} from "@/store";
import {kSetCommunicationToken} from "@/store/token";

export const useToken = () => {
    const {token, tokenDispatch} = useStore()
    useEffect(() => {
        getToken().then(res => {
                tokenDispatch({type: kSetCommunicationToken, payload: res})
            }
        )
    }, [])
    return token
}

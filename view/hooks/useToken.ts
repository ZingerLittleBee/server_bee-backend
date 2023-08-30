import {verifyToken} from "@/requests/token";
import {useStore} from "@/store";
import {kSetCommunicationToken} from "@/store/token";
import {useEffect} from "react";

export const useToken = () => {
    const {token, tokenDispatch} = useStore()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            tokenDispatch({type: kSetCommunicationToken, payload: token})
        }
    }, [])

    const verify = async (token: string) => {
        const res = await verifyToken(token)
        if (res) {
            tokenDispatch({type: kSetCommunicationToken, payload: token})
        }
        return res
    }

    const isVerified = async () => token?.communicationToken ? verify(token.communicationToken) : false

    return {
        token,
        verify,
        isVerified
    }
}

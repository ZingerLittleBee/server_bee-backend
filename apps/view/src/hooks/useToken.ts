import { useEffect } from 'react'
import { kCommunicationToken } from '@/const'
import { verifyToken } from '@/requests/token'
import { useStore } from '@/store'
import { kSetCommunicationToken, kSetIsVerified } from '@/store/token'

export const useToken = () => {
    const { token, tokenDispatch } = useStore()

    useEffect(() => {
        const token = localStorage.getItem(kCommunicationToken)
        if (token) {
            tokenDispatch({ type: kSetCommunicationToken, payload: token })
        }
    }, [tokenDispatch])

    const verify = async (token: string) => {
        const res = await verifyToken(token)
        if (res) {
            tokenDispatch({ type: kSetCommunicationToken, payload: token })
            tokenDispatch({ type: kSetIsVerified, payload: true })
        }
        return res
    }

    const isVerified = async () => {
        if (token.isVerified) {
            return true
        }
        return verify(token.communicationToken || '')
    }

    return {
        token,
        verify,
        isVerified,
    }
}

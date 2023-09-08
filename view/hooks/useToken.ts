import { useEffect } from "react"
import { kCommunicationToken } from "@/const"
import { verifyToken } from "@/requests/token"
import { useStore } from "@/store"
import { kSetCommunicationToken } from "@/store/token"

export const useToken = () => {
  const { token, tokenDispatch } = useStore()

  useEffect(() => {
    const token = localStorage.getItem(kCommunicationToken)
    if (token) {
      tokenDispatch({ type: kSetCommunicationToken, payload: token })
    }
  }, [])

  const verify = async (token: string) => {
    const res = await verifyToken(token)
    if (res) {
      tokenDispatch({ type: kSetCommunicationToken, payload: token })
    }
    return res
  }

  const isVerified = async () =>
    token?.communicationToken ? verify(token.communicationToken) : false

  return {
    token,
    verify,
    isVerified,
  }
}

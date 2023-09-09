import { Loader2 } from "lucide-react"
import { ComponentType, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useToken } from "@/hooks/useToken"

export default function WithAuth(WrappedComponent: ComponentType) {
  return function AuthComponent(props: any) {
    const router = useNavigate()
    const [loading, setLoading] = useState(true)
    const { token, isVerified } = useToken()

    const isVerifiedCb = useCallback(async () => {
      return isVerified()
    }, [token.communicationToken])

    useEffect(() => {
      if (token.communicationToken) {
        ;(async () => {
          const isValid = await isVerifiedCb()
          if (!isValid) {
            setTimeout(() => {
              setLoading(false)
              router("/login")
            }, 500)
          } else {
            setLoading(false)
          }
        })()
      } else {
        setLoading(false)
        router("/login")
      }
    }, [token.communicationToken, isVerifiedCb, router])

    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader2 size={60} className="animate-spin" />
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}

import React, { ComponentType, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useToken } from "@/hooks/useToken"

export default function WithAuth(WrappedComponent: ComponentType) {
  return function AuthComponent(props: any) {
    const router = useRouter()
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
              router.replace("/login")
            }, 500)
          } else {
            setLoading(false)
          }
        })()
      } else {
        router.replace("/login")
      }
    }, [token.communicationToken, isVerifiedCb, router])

    if (loading) {
      return (
        <div className="h-full flex justify-center items-center">
          <Loader2 size={60} className="animate-spin" />
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}

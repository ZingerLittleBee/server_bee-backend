import { api } from '@/trpc/react'

export default function useServerList() {
    const { data } = api.server.list.useQuery()

    return data ?? []
}

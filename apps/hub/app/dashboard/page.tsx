'use client'

import { api } from '@/trpc/react'

import DashboardContent from '@/app/dashboard/content'

export default function DashboardPage() {
    const { data: record, refetch } = api.dashboard.fetch.useQuery(undefined, {
        refetchInterval: 1000,
        staleTime: 0,
    })

    // useEffect(() => {
    //     const task = setInterval(() => {
    //         refetch()
    //     }, 1000)
    //
    //     return () => clearInterval(task)
    // }, [])

    return <DashboardContent fusion={record?.fusion} />
}

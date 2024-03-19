'use server'

import { api } from '@/trpc/server'
import { type RouterOutputs } from '@/trpc/shared'

export async function getData(): Promise<{
    servers: RouterOutputs['server']['list']
    groups: RouterOutputs['group']['list']
}> {
    const servers = await api.server.list.query()
    const groups = await api.group.list.query()

    return {
        servers: servers,
        groups: groups,
    }
}

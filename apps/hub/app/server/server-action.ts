'use server'

import { api } from '@/trpc/server'
import { type RouterOutputs } from '@/trpc/shared'

export async function getData(): Promise<{
    servers: RouterOutputs['server']['list'] & {
        group?: string
    }
    groups: RouterOutputs['group']['list']
}> {
    const servers = await api.server.list.query()
    const groups = await api.group.list.query()

    return {
        servers: servers.map((s) => ({
            ...s,
            group:
                groups.find(
                    (g) =>
                        g.servers.findIndex((server) => server.id === s.id) > -1
                )?.name ?? undefined,
        })),
        groups: groups,
    }
}

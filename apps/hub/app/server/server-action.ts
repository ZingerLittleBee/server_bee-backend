'use server'

import type { Group } from '@/server/api/routers/group'
import { api } from '@/trpc/server'

import type { Server } from '@/app/server/columns'

export async function getData(): Promise<{
    servers: Server[]
    groups: Group[]
}> {
    const servers = await api.server.list.query()
    const groups = await api.group.list.query()

    return {
        servers: servers.map<Server>((server) => ({
            id: server.id,
            name: server.name,
            description: server.description ?? undefined,
            createdAt: server.createdAt,
        })),
        groups: groups.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description ?? undefined,
            sortWeight: group.sortWeight,
        })),
    }
}

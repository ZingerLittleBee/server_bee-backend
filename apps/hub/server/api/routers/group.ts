import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export type Group = {
    id: string
    name: string
    description?: string
    servers: {
        id: string
        name: string
        description?: string
    }[]
}
export const groupRouter = createTRPCRouter({
    list: publicProcedure.query(({ ctx }) => {
        return ctx.db.group.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                servers: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                    orderBy: {
                        sortWeight: 'desc',
                    },
                },
            },
            orderBy: {
                sortWeight: 'desc',
            },
        })
    }),
})

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export type Group = {
    id: string
    name: string
    description?: string
    sortWeight: number
}
export const groupRouter = createTRPCRouter({
    list: publicProcedure.query(({ ctx }) => {
        return ctx.db.group.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                sortWeight: true,
            },
        })
    }),
})

import { NotLoggedInError } from '@/server/api/error'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { z } from 'zod'

import { getLogger } from '@/lib/logging'

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

const logger = getLogger('group.ts')

export const groupRouter = createTRPCRouter({
    list: publicProcedure.query(({ ctx }) => {
        return ctx.db.group.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                sortWeight: true,
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
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                description: z.string().optional(),
                sortWeight: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) throw NotLoggedInError

            try {
                await ctx.db.group.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        sortWeight: input.sortWeight,
                    },
                })
                return true
            } catch (e) {
                logger.error(`Error creating group: ${JSON.stringify(e)}`)
                return false
            }
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                description: z.string().optional(),
                sortWeight: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) throw NotLoggedInError

            try {
                await ctx.db.group.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        name: input.name,
                        description: input.description,
                        sortWeight: input.sortWeight,
                    },
                })
                return true
            } catch (e) {
                logger.error(`Error updating group: ${JSON.stringify(e)}`)
                return false
            }
        }),
    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) throw NotLoggedInError

            try {
                await ctx.db.group.delete({
                    where: {
                        id: input,
                    },
                })
                return true
            } catch (e) {
                logger.error(`Error deleting group: ${JSON.stringify(e)}`)
                return false
            }
        }),
})

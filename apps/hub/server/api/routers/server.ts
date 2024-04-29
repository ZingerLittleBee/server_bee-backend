import { NotLoggedInError } from '@/server/api/error'
import {
    createTRPCRouter,
    getCaller,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { type Prisma } from '@serverbee/db'
import { z } from 'zod'

import { getLogger } from '@/lib/logging'

const logger = getLogger('server.ts')

export const serverRouter = createTRPCRouter({
    list: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.server.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                sortWeight: true,
                group: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                {
                    group: {
                        sortWeight: 'desc',
                    },
                },
                {
                    sortWeight: 'desc',
                },
            ],
        })
    }),
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                description: z.string().optional(),
                sortWeight: z.number().optional(),
                group: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) throw NotLoggedInError

            const createData: Prisma.ServerCreateInput = {
                name: input.name,
                description: input.description,
                sortWeight: input.sortWeight,
                owner: { connect: { id: ctx.session.user.id } },
            }
            if (input.group) {
                createData.group = {
                    connect: {
                        id: input.group,
                    },
                }
            }

            const server = await ctx.db.server.create({
                data: createData,
            })

            const caller = await getCaller()

            const token: {
                id: number
                token: string
                isExpires: boolean
                serverId: string
            } = await caller.serverToken.create({
                serverId: server.id,
            })
            return token
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                description: z.string().optional(),
                sortWeight: z.number().optional(),
                group: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) throw NotLoggedInError
            try {
                await ctx.db.server.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        name: input.name,
                        description: input.description,
                        sortWeight: input.sortWeight,
                        group: input.group
                            ? {
                                  connect: {
                                      id: input.group,
                                  },
                              }
                            : undefined,
                    },
                })
                return true
            } catch (e) {
                logger.error(`Failed to update server: ${JSON.stringify(e)}`)
                return false
            }
        }),
    getOwnServerIds: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.session.user) throw NotLoggedInError
        const result = await ctx.db.server.findMany({
            where: {
                ownerId: ctx.session.user.id,
            },
            select: {
                id: true,
            },
        })
        return result.map((item) => item.id)
    }),
    delete: protectedProcedure
        .input(z.string())
        .mutation(async ({ input, ctx }) => {
            if (!ctx.session.user) throw NotLoggedInError
            const server = await ctx.db.server.findFirst({
                where: {
                    id: input,
                    ownerId: ctx.session.user.id,
                },
            })
            if (!server) return
            await ctx.db.server.delete({
                where: {
                    id: input,
                },
            })
        }),
})

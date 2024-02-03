import { env } from '@/env'
import { NotLoggedInError } from '@/server/api/error'
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from '@/server/api/trpc'
import { type Prisma } from '@prisma/client'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

export const serverRouter = createTRPCRouter({
    list: publicProcedure.query(({ ctx }) => {
        return ctx.db.server.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
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
                group: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) throw NotLoggedInError

            const createData: Prisma.ServerCreateInput = {
                name: input.name,
                description: input.description,
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

            const payload = {
                userId: ctx.session.user.id,
                serverId: server.id,
            }

            const token = sign(payload, env.SERVER_JWT_SECRET)

            const serverToken = await ctx.db.serverToken.create({
                data: {
                    token,
                    server: { connect: { id: server.id } },
                },
            })
            return serverToken.token
        }),
    getTokens: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            if (!ctx.session.user) throw NotLoggedInError
            const queryResult = await ctx.db.serverToken.findMany({
                where: {
                    serverId: input.id,
                },
            })
            return queryResult.map((item) => item.token)
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

import { env } from '@/env'
import { NotLoggedInError } from '@/server/api/error'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

export const serverRouter = createTRPCRouter({
    list: protectedProcedure.query(({ ctx }) => {
        if (!ctx.session.user) throw NotLoggedInError
        return ctx.db.server.findMany()
    }),
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session.user) throw NotLoggedInError

            const server = await ctx.db.server.create({
                data: {
                    name: input.name,
                    description: input.description,
                    owner: { connect: { id: ctx.session.user.id } },
                },
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
})

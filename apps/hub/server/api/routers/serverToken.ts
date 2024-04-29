import { env } from '@/env'
import { NotLoggedInError } from '@/server/api/error'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'

import { getLogger } from '@/lib/logging'

const logger = getLogger('server-token.ts')

export const serverTokenRouter = createTRPCRouter({
    list: protectedProcedure
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
            return queryResult.map((item) => ({
                ...item,
            }))
        }),
    create: protectedProcedure
        .input(
            z.object({
                serverId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const payload = {
                serverId: input.serverId,
            }

            const token = sign(payload, env.SERVER_JWT_SECRET)

            const serverToken = await ctx.db.serverToken.create({
                data: {
                    token,
                    server: { connect: { id: input.serverId } },
                },
            })
            return {
                id: serverToken.id,
                token: serverToken.token,
                isExpires: false,
                serverId: serverToken.serverId,
            }
        }),
    delete: protectedProcedure
        .input(
            z.object({
                token: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const token = await ctx.db.serverToken.findFirst({
                where: {
                    token: input.token,
                },
            })
            if (token) {
                await ctx.db.serverToken.delete({
                    where: {
                        id: token.id,
                    },
                })

                await ctx.mongo
                    .db('serverbee')
                    .collection('invalid')
                    .insertOne({ token: input.token })

                logger.info(`Token ${input.token} deleted`)
            }
        }),
})

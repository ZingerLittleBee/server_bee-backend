import { env } from '@/env'
import { createTRPCRouter, getCaller, publicProcedure } from '@/server/api/trpc'
import { hashSync } from 'bcrypt'
import { z } from 'zod'

import { getLogger } from '@/lib/logging'

const logger = getLogger('user.ts')

export const userRouter = createTRPCRouter({
    hasUser: publicProcedure.query(async ({ ctx }) => {
        return (await ctx.db.user.count()) > 0
    }),
    /**
     * reject if user count is greater than 0
     */
    initUser: publicProcedure
        .input(
            z.object({
                username: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const caller = await getCaller()
            const hasUser = await caller.user.hasUser()
            if (hasUser) {
                logger.warn('Already has user')
                return
            }
            try {
                const saltRounds =
                    typeof env.SALT_ROUNDS === 'string'
                        ? parseInt(env.SALT_ROUNDS)
                        : env.SALT_ROUNDS

                await ctx.db.user.create({
                    data: {
                        name: input.username,
                        password: hashSync(input.password, saltRounds),
                    },
                })
                return true
            } catch (e) {
                logger.error(`Failed to init user: ${JSON.stringify(e)}`)
                return false
            }
        }),
})

import { dashboardRouter } from '@/server/api/routers/dashboard'
import { groupRouter } from '@/server/api/routers/group'
import { serverRouter } from '@/server/api/routers/server'
import { userRouter } from '@/server/api/routers/user'
import { createTRPCRouter } from '@/server/api/trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    server: serverRouter,
    dashboard: dashboardRouter,
    group: groupRouter,
    user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

import { EventEmitter } from 'events'
import { inspect } from 'util'
import { NotLoggedInError } from '@/server/api/error'
import {
    createTRPCRouter,
    getCaller,
    protectedProcedure,
} from '@/server/api/trpc'
import { mongo } from '@/server/db'
import { Record } from '@serverbee/types/src/record'
import { observable } from '@trpc/server/observable'

import { getLogger } from '@/lib/logging'

const logger = getLogger('dashboard.ts')

const ee = new EventEmitter()

export const dashboardRouter = createTRPCRouter({
    fetch: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.session.user) throw NotLoggedInError

        try {
            const database = mongo.db('serverbee')
            const recordCollection = database.collection<Record>('record')

            const record = await recordCollection
                .find()
                .sort({ time: -1 })
                .limit(1)
                .toArray()

            logger.info(`Record fetched: ${inspect(record[0]?.time)}`)

            return record[0]
        } catch (e) {
            logger.error(`Error fetching record: ${e}`)
        }
    }),
})

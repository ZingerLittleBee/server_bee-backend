import { env } from '@/env'
import pino, { type Logger } from 'pino'

export function getLogger(name: string): Logger {
    return pino(
        {
            name,
            level: env.NODE_ENV === 'production' ? 'info' : 'trace',
        },

        pino.destination('./pino-logger.log')
    )
}

import { env } from '@/env'
import { PrismaClient } from '@serverbee/db'
import { MongoClient } from 'mongodb'

const globalForDatabase = globalThis as unknown as {
    prisma: PrismaClient | undefined
    mongo: MongoClient | undefined
}

export const db =
    globalForDatabase.prisma ??
    new PrismaClient({
        log:
            env.NODE_ENV === 'development'
                ? ['query', 'error', 'warn']
                : ['error'],
    })

if (env.NODE_ENV !== 'production') globalForDatabase.prisma = db
export const mongo = globalForDatabase.mongo ?? new MongoClient(env.MONGODB_URI)

if (env.NODE_ENV !== 'production') globalForDatabase.mongo = mongo

import { type NextRequest } from 'next/server'
import { db } from '@/server/db'
import { getToken } from 'next-auth/jwt'

import { getLogger } from '@/lib/logging'

const logger = getLogger('api:server:route')

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({
            req,
        })

        logger.info(`token: ${JSON.stringify(token)})`)

        if (!token?.id)
            return new Response(null, {
                status: 401,
            })

        const serverIds = await getServerIdsByUserId(
            (token as { id: string }).id
        )

        return new Response(JSON.stringify(serverIds), {
            status: 200,
        })
    } catch {
        return new Response(null, {
            status: 401,
        })
    }
}

const getServerIdsByUserId = async (userId: string): Promise<string[]> => {
    return (
        (
            await db.server.findMany({
                where: {
                    ownerId: userId,
                },
                select: {
                    id: true,
                },
            })
        )?.map((server) => server.id) ?? []
    )
}

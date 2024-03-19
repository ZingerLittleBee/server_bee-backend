import { type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({
            req,
        })
        return new Response(null, {
            status: !!token ? 200 : 401,
        })
    } catch {
        return new Response(null, {
            status: 401,
        })
    }
}

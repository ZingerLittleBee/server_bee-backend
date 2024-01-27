import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })

    if (!token) {
        return NextResponse.redirect(new URL('/api/auth/signin', request.url))
    }
}

export const config = {
    matcher: ['/server/:path*', '/dashboard/:path*'],
}

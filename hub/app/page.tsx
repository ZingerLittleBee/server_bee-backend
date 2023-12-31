import Link from 'next/link'
import { getServerAuthSession } from '@/server/auth'
import { api } from '@/trpc/server'

export default async function Home() {
    const hello = await api.server.hello.query({ text: 'from tRPC' })
    const session = await getServerAuthSession()

    console.log('session', session)

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="flex flex-col items-center gap-2">
                <p className="text-2xl text-white">
                    {hello ? hello.greeting : 'Loading tRPC query...'}
                </p>

                <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-center text-2xl text-white">
                        <span>Logged in as {session?.user.username}</span>
                    </p>
                    <Link
                        href={
                            session ? '/api/auth/signout' : '/api/auth/signin'
                        }
                        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                    >
                        {session ? 'Sign out' : 'Sign in'}
                    </Link>
                </div>
            </div>
        </main>
    )
}

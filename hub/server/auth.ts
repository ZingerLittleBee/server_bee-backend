import { db } from '@/server/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string
            username: string
            // ...other properties
            // role: UserRole;
        } & DefaultSession['user']
    }

    interface JWT {
        id: string
        username: string
    }

    interface User {
        id: string
        username: string
    }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
        async signIn({ user }) {
            return !!user?.id
        },
        jwt: async ({ token, user }) => {
            if (user) {
                token = { ...user }
            }
            return token
        },
        session: ({ session, token, user }) => {
            console.log('session token', token)
            console.log('session user', user)
            if (token) {
                session.user.id = token.id as string
                session.user.username = token.username as string
            }
            return session
        },
    },
    adapter: PrismaAdapter(db),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                return { id: '123123', username: credentials.username }

                // const { username, password } =  credentials
                // const user = await db.user.findUnique({
                //   where: {
                //     name: username
                //   },
                // })
                //
                // if (!user) return null
                //
                // const isMatch = await bcrypt.compare(user.password, password)
                //
                // return isMatch ? user : null
            },
        }),
    ],
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions)

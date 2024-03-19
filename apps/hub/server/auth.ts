import { db } from '@/server/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcrypt'
import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
    type User,
} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { getLogger } from '@/lib/logging'

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

const logger = getLogger('Auth')

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

                // return { id: '123123', username: credentials.username }

                const { username, password } = credentials
                const user = await db.user.findUnique({
                    where: {
                        name: username,
                    },
                })

                if (!user) {
                    logger.error(`User not found with username: ${username}`)
                    return null
                }

                const isMatch = await compare(password, user.password)
                if (!isMatch) {
                    logger.error('Password does not match')
                    return null
                }

                return {
                    id: user.id,
                    username: user.name,
                } as User
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

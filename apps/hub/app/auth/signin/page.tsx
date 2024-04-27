'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function SignInPage() {
    const { toast } = useToast()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSignIn = async () => {
        const result = await signIn('credentials', {
            username,
            password,
        })

        if (result?.ok) {
            toast({
                title: 'Sign in successful',
            })
        } else {
            toast({
                title: 'Sign in failed',
                description: 'Please try again',
            })
        }
    }

    return (
        <div>
            <Card className="mx-auto grid max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your username below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" onClick={handleSignIn}>
                            Login
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="#" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

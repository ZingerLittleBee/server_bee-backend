'use client'

import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/trpc/react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import InputPassword from '@/components/ui/input-password'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

export default function InitPage() {
    const {
        data: hasInit,
        isLoading,
        isInitialLoading,
    } = api.user.hasUser.useQuery()
    const { mutateAsync: createUser } = api.user.initUser.useMutation()

    const router = useRouter()

    const [shouldRender, setShouldRender] = useState(false)

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (isLoading || isInitialLoading) return
        if (hasInit) {
            router.push('/')
        } else {
            setShouldRender(true)
        }
    }, [hasInit, isLoading, isInitialLoading, router])

    if (!shouldRender) return <>Loading...</>

    const onSubmit = async () => {
        if (!username || !password) {
            toast({
                variant: 'destructive',
                title: 'Username and Password are Required!',
            })
            return
        }

        const result = await createUser({ username, password })
        if (result) {
            toast({
                title: 'Account created',
            })
            router.push('/')
        } else {
            toast({
                variant: 'destructive',
                title: 'Failed to create account, please check server logs.',
            })
        }
    }

    return (
        <Card className="w-[380px]">
            <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                    Create a admin account to get started
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <InputPassword
                        id="password"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                        }
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onSubmit}>Create</Button>
            </CardFooter>
        </Card>
    )
}

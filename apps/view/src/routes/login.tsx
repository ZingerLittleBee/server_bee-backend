import { useState } from 'react'
import { kCommunicationToken } from '@/const'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import * as z from 'zod'

import { useToken } from '@/hooks/useToken'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

const loginFormSchema = z.object({
    token: z.string().min(1),
})

type LoginFormValue = z.infer<typeof loginFormSchema>

export default function LoginPage() {
    const { verify } = useToken()
    const [showPassword, setShowPassword] = useState(false)
    const [checked, setChecked] = useState(true)
    const router = useNavigate()

    const form = useForm<LoginFormValue>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            token: '',
        },
    })

    const onSubmit = async (data: LoginFormValue) => {
        const value = data.token
        const res = await verify(value)
        if (res) {
            if (checked) {
                localStorage.setItem(kCommunicationToken, value)
            }
            toast({
                title: 'Verify success',
            })
            setTimeout(() => router('/'), 1000)
        } else {
            toast({
                variant: 'destructive',
                title: 'Verify failed',
                description: 'please check your token and try again.',
            })
        }
    }

    return (
        <div className="flex h-full flex-col justify-center space-y-10">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Login to your dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                    {'Have questions? '}
                    <Link
                        to="https://docs.serverbee.app/question/faq"
                        target="_blank"
                        className="text-sm underline underline-offset-4 hover:text-primary"
                    >
                        Read the FAQ
                    </Link>
                </p>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid content-center justify-center gap-y-6"
                >
                    <FormField
                        control={form.control}
                        name="token"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Token</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            {...field}
                                            placeholder="Your token"
                                            className="w-screen max-w-[320px] sm:max-w-[400px]"
                                        />
                                        {showPassword ? (
                                            <EyeOff
                                                className="absolute right-2 top-[25%] cursor-pointer text-muted-foreground"
                                                size={20}
                                                onClick={() =>
                                                    setShowPassword(false)
                                                }
                                            />
                                        ) : (
                                            <Eye
                                                className="absolute right-2 top-[25%] cursor-pointer  text-muted-foreground"
                                                size={20}
                                                onClick={() =>
                                                    setShowPassword(true)
                                                }
                                            />
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    This is the token for communication.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember me"
                            checked={checked}
                            onCheckedChange={(state) => setChecked(!!state)}
                        />
                        <label
                            htmlFor="remember me"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Remember me
                        </label>
                    </div>
                    <Button className="w-full" type="submit">
                        Confirm
                    </Button>
                </form>
            </Form>
        </div>
    )
}

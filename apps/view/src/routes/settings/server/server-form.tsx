import { useEffect, useMemo } from 'react'
import { updateServerSettings } from '@/requests/settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { useLoadingBtn } from '@/hooks/useLoadingBtn'
import { useSettings } from '@/hooks/useSettings'
import { useToken } from '@/hooks/useToken'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

const serverFormSchema = z.object({
    url: z.string(),
    token: z.string(),
})

type ServerFormValues = z.infer<typeof serverFormSchema>

export function ServerForm() {
    const { settings } = useSettings()
    const { LoadingBtn, setIsLoading: setIsBtnLoading } = useLoadingBtn()
    const { token } = useToken()

    const serverConfig = useMemo(() => settings?.server, [settings])

    const form = useForm<ServerFormValues>({
        resolver: zodResolver(serverFormSchema),
        defaultValues: {
            url: serverConfig?.url ?? '',
            token: serverConfig?.token ?? '',
        },
    })

    useEffect(() => {
        if (form.formState.isDirty) return
        form.setValue('url', serverConfig?.url ?? '')
        form.setValue('token', serverConfig?.token ?? '')
    }, [form, serverConfig])

    async function onSubmit(data: ServerFormValues) {
        setIsBtnLoading(true)
        const res = await updateServerSettings(
            {
                url: data.url,
                token: data.token,
            },
            token.communicationToken
        )
        if (res) {
            toast({
                title: 'Update Successfully',
            })
        } else {
            toast({
                title: 'Update Error',
                description: 'Please check console for more details.',
                variant: 'destructive',
            })
        }
        setIsBtnLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Your recorder service url"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Such as https://recorder.serverhub.app
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Token</FormLabel>
                            <FormControl>
                                <Input placeholder="Your token" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the token for communication with the app
                                and web page.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <LoadingBtn type="submit">Update Server</LoadingBtn>
            </form>
        </Form>
    )
}

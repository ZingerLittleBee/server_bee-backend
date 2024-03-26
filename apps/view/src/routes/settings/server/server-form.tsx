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
import { Switch } from '@/components/ui/switch.tsx'
import { toast } from '@/components/ui/use-toast'

const serverFormSchema = z.object({
    enableRecord: z.boolean().default(false),
    url: z.string(),
    token: z.string(),
    recordInterval: z.string().optional(),
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
            enableRecord: serverConfig?.enableRecord ?? false,
            url: serverConfig?.url ?? '',
            token: serverConfig?.token ?? '',
            recordInterval: serverConfig?.recordInterval?.toString() ?? '',
        },
    })

    useEffect(() => {
        if (form.formState.isDirty) return
        form.setValue('enableRecord', serverConfig?.enableRecord ?? false)
        if (serverConfig?.url) {
            form.setValue('url', serverConfig.url)
        }
        if (serverConfig?.token) {
            form.setValue('token', serverConfig.token)
        }
        if (serverConfig?.recordInterval) {
            form.setValue(
                'recordInterval',
                serverConfig.recordInterval.toString()
            )
        }
    }, [form, serverConfig])

    async function onSubmit(data: ServerFormValues) {
        setIsBtnLoading(true)
        const res = await updateServerSettings(
            {
                enableRecord: data.enableRecord,
                url: data.url,
                token: data.token,
                recordInterval: data.recordInterval
                    ? parseInt(data.recordInterval)
                    : undefined,
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
                    name="enableRecord"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Enable Record
                                </FormLabel>
                                <FormDescription>
                                    Enable record to record data to recorder
                                    service.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {form.getValues('enableRecord') && (
                    <>
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
                                        <Input
                                            placeholder="Your token"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is the token for communication with
                                        the app and web page.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="recordInterval"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Record Interval</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Interval"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The interval between each record, in
                                        seconds.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <LoadingBtn type="submit">Update Server</LoadingBtn>
                    </>
                )}
            </form>
        </Form>
    )
}

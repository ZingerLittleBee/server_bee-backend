"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import * as z from "zod"

import {toast} from "@/components/ui/use-toast"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";
import {useSettings} from "@/hooks/useSettings";
import {useEffect, useMemo} from "react";
import {updateServerSettings} from "@/requests/settings";
import {useLoadingBtn} from "@/hooks/useLoadingBtn";
import {useToken} from "@/hooks/useToken";

const serverFormSchema = z.object({
    host: z.string().refine(value =>
            // domain
            /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/.test(value) ||
            // IPv4
            /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value) || 'localhost' === value,
        {message: 'Invalid domain name or IP address.'}
    ),
    token: z.string(),
    disableSsl: z.boolean(),
})

type ServerFormValues = z.infer<typeof serverFormSchema>


export function ServerForm() {
    const {settings, isLoading} = useSettings()
    const { LoadingBtn, setIsLoading: setIsBtnLoading } = useLoadingBtn()
    const {token} = useToken()

    const serverConfig = useMemo(() => settings?.server, [settings])

    const form = useForm<ServerFormValues>({
        resolver: zodResolver(serverFormSchema),
        defaultValues: {
            host: serverConfig?.host ?? '',
            token: serverConfig?.token ?? '',
            disableSsl: serverConfig?.disableSsl ?? false,
        },
    })

    useEffect(() => {
        if (form.formState.isDirty) return
        form.setValue("host", serverConfig?.host ?? '')
        form.setValue("token", serverConfig?.token ?? '')
        form.setValue("disableSsl", serverConfig?.disableSsl ?? false)
    }, [serverConfig])

    async function onSubmit(data: ServerFormValues) {
        setIsBtnLoading(true)
        const res = await updateServerSettings({
            host: data.host,
            token: data.token,
            disable_ssl: data.disableSsl,
        }, token.communicationToken)
        if (res) {
            toast({
                title: "Update Successfully",
            })
        } else {
            toast({
                title: "Update Error",
                description: "Please check console for more details.",
                variant: "destructive"
            })
        }
        setIsBtnLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="host"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Host</FormLabel>
                            <FormControl>
                                <Input placeholder="Your host" {...field} />
                            </FormControl>
                            <FormDescription>
                                Domain or IP, not including http(s)://
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="token"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Token</FormLabel>
                            <FormControl>
                                <Input placeholder="Your token" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is the token for communication with the app and web page.
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="disableSsl"
                    render={({field}) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Enable SSL
                                </FormLabel>
                                <FormDescription>
                                    Enable HTTPS or WSS for the server.
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
                <LoadingBtn type="submit">Update Server</LoadingBtn>
            </form>
        </Form>
    )
}

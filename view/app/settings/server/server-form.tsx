"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import * as z from "zod"

import {Button} from "@/components/ui/button"
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

const serverFormSchema = z.object({
    host: z.string().refine(value =>
            // domain
            /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/.test(value) ||
            // IPv4
            /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value),
        {message: 'Invalid domain name or IP address.'}
    ),
    token: z.string(),
    ssl: z.boolean(),
})

type ServerFormValues = z.infer<typeof serverFormSchema>


export function ServerForm() {
    const form = useForm<ServerFormValues>({
        resolver: zodResolver(serverFormSchema),
        defaultValues: {},
    })

    function onSubmit(data: ServerFormValues) {
        toast({
            title: "You submitted the following values:",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
            ),
        })
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
                    name="ssl"
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
                <Button type="submit">Update server</Button>
            </form>
        </Form>
    )
}

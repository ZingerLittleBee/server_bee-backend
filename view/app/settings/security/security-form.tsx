"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import * as z from "zod"

import {Button} from "@/components/ui/button"

import {Input} from "@/components/ui/input"

import {toast} from "@/components/ui/use-toast"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

const securityFormSchema = z.object({
    name: z.string()
})

type SecurityFormValues = z.infer<typeof securityFormSchema>

const defaultValues: Partial<SecurityFormValues> = {}

export function SecurityForm() {
    const form = useForm<SecurityFormValues>({
        resolver: zodResolver(securityFormSchema),
        defaultValues,
    })

    function onSubmit(data: SecurityFormValues) {
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
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Communication token</FormLabel>
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
                <Button type="submit">Update security</Button>
            </form>
        </Form>
    )
}

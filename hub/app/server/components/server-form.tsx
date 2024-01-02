'use client'

import * as React from 'react'
import { useBoundStore } from '@/store'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export enum ServerFormMode {
    Create,
    Edit,
}

const formSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export type ServerFormProps = {
    mode: ServerFormMode
    server?: FormValues
    onSubmit?: () => void
}

export function ServerForm({ mode, server, onSubmit }: ServerFormProps) {
    const { mutateAsync } = api.server.create.useMutation()
    const setIsOpen = useBoundStore.use.setIsOpenServerForm()
    const setTokenDialogProps = useBoundStore.use.setTokenDialogProps()
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: undefined,
        },
    })

    async function onFormSubmit(data: z.infer<typeof formSchema>) {
        const token = await mutateAsync(data)
        setTokenDialogProps({
            title: 'Server created!',
            description: 'Copy the token for communication with the node',
            tokens: [token],
        })
        setIsOpen(true)
        onSubmit?.()
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onFormSubmit)}
                className="space-y-8"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Type description here."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <Button type="submit">
                        {mode === ServerFormMode.Create
                            ? 'Create'
                            : 'Save changes'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

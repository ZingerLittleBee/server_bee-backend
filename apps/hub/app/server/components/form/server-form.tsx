'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getData } from '@/app/server/server-action'

export enum ServerFormMode {
    Create,
    Edit,
}

const formSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    group: z.string().optional(),
})

export type FormValues = z.infer<typeof formSchema>

export type ServerFormProps = {
    mode: ServerFormMode
    id?: string
    server?: FormValues
    onSubmit?: () => void
}

const NoGroup = 'no-group'

export function ServerForm({ mode, id, server, onSubmit }: ServerFormProps) {
    const router = useRouter()
    const { data: groups } = api.group.list.useQuery()
    const { mutateAsync } = api.server.create.useMutation()
    const { mutateAsync: updateServer } = api.server.update.useMutation()
    const setIsOpen = useBoundStore.use.setIsOpenServerForm()
    const setTokenDialogProps = useBoundStore.use.setTokenDialogProps()
    const setIsOpenTokenDialog = useBoundStore.use.setIsOpenTokenDialog()
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:
            mode === ServerFormMode.Edit
                ? {
                      name: server?.name,
                      description: server?.description,
                      group: server?.group ?? NoGroup,
                  }
                : {
                      name: '',
                      description: undefined,
                      group: undefined,
                  },
    })

    async function onFormSubmit(data: z.infer<typeof formSchema>) {
        const params =
            data.group === NoGroup ? { ...data, group: undefined } : data

        if (mode === ServerFormMode.Create) {
            const token = await mutateAsync(params)
            setTokenDialogProps({
                title: 'Server created!',
                description: 'Copy the token for communication with the node',
                tokens: [token],
            })
            setIsOpen(false)
            setIsOpenTokenDialog(true)
        }

        if (mode === ServerFormMode.Edit && id) {
            await updateServer({
                ...params,
                id: id,
            })
            setIsOpen(false)
        }
        onSubmit?.()
        await getData()
        router.refresh()
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
                <FormField
                    control={form.control}
                    name="group"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Group</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem
                                                key={NoGroup}
                                                value={NoGroup}
                                            >
                                                No group
                                            </SelectItem>
                                            {groups?.map((group) => (
                                                <SelectItem
                                                    key={group.id}
                                                    value={group.id}
                                                >
                                                    <div className="space-x-4">
                                                        <span className="hover:underline">
                                                            {group.name}
                                                        </span>
                                                        <span className="text-muted-foreground truncate text-sm">
                                                            {group.description}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
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

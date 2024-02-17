'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { FormMode } from '@/constant/enum/mode'
import { useBoundStore } from '@/store'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { NumberInput } from '@tremor/react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { getData } from '@/app/server/server-action'

const formSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    sortWeight: z.string().optional(),
})

export type GroupFormValues = z.infer<typeof formSchema>

export type GroupFormProps = {
    mode: FormMode
    id?: string
    group?: GroupFormValues
    onSubmit?: () => void
}

export function GroupForm({ mode, id, group, onSubmit }: GroupFormProps) {
    const router = useRouter()
    const { mutateAsync } = api.group.create.useMutation()
    const { mutateAsync: updateServer } = api.group.update.useMutation()
    const setIsOpen = useBoundStore.use.setIsOpenServerForm()
    const form = useForm<GroupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:
            mode === FormMode.Edit
                ? {
                      name: group?.name,
                      description: group?.description,
                      sortWeight: group?.sortWeight,
                  }
                : {
                      name: '',
                      description: undefined,
                      sortWeight: '0',
                  },
    })

    async function onFormSubmit(data: z.infer<typeof formSchema>) {
        const params = {
            ...data,
            sortWeight: data.sortWeight ? +data.sortWeight : 0,
        }

        if (mode === FormMode.Create) {
            await mutateAsync(params)
        }

        if (mode === FormMode.Edit && id) {
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
                className="space-y-4"
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
                    name="sortWeight"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SortWeight</FormLabel>
                            <FormDescription className="flex flex-col items-start">
                                <span>
                                    The higher the weight, the higher the sort
                                    order.
                                </span>
                                <span>
                                    First, sort by the weight of the group, and
                                    then sort by the weight of the server.
                                </span>
                            </FormDescription>
                            <FormControl>
                                <NumberInput
                                    className="mx-auto max-w-sm"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                    <Button type="submit">
                        {mode === FormMode.Create ? 'Create' : 'Save changes'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { MinusCircle, PlusCircle } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { useLoadingBtn } from '@/hooks/useLoadingBtn'
import { useSettings } from '@/hooks/useSettings'
import { Button } from '@/components/ui/button.tsx'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input.tsx'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover.tsx'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select.tsx'
import { Switch } from '@/components/ui/switch.tsx'

const cursorStyleOptions = ['block', 'underline', 'bar']
const fontWeightOptions = [
    'normal',
    'bold',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
]

const terminalFormSchema = z.object({
    copyOnSelect: z.boolean().optional(),
    cursorBlink: z.boolean().optional(),
    cursorStyle: z.enum(cursorStyleOptions as [string, ...string[]]).optional(),
    fontSize: z.number().min(12).max(20),
    fontFamily: z.string().optional(),
    fontWeight: z.enum(fontWeightOptions as [string, ...string[]]).optional(),
    background: z.string().optional(),
    foreground: z.string().optional(),
    selectionBackground: z.string().optional(),
    selectionForeground: z.string().optional(),
})

type TerminalFormValues = z.infer<typeof terminalFormSchema>

export function TerminalForm() {
    const { settings } = useSettings()
    const { LoadingBtn, setIsLoading: setIsBtnLoading } = useLoadingBtn()

    const appConfig = useMemo(() => settings?.app, [settings])

    const form = useForm<TerminalFormValues>({
        resolver: zodResolver(terminalFormSchema),
        defaultValues: {
            fontSize: 14,
        },
    })

    useEffect(() => {
        if (form.formState.isDirty) return
    }, [form, appConfig])

    async function onSubmit(data: TerminalFormValues) {
        setIsBtnLoading(true)
        // const res = await updateSecuritySettings(
        //     {
        //         token: data.token,
        //     },
        //     token.communicationToken
        // )
        // if (res) {
        //     toast({
        //         title: 'Update Successfully',
        //     })
        // } else {
        //     toast({
        //         title: 'Update Error',
        //         description: 'Please check console for more details.',
        //         variant: 'destructive',
        //     })
        // }
        setIsBtnLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name="copyOnSelect"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Copy On Select
                                    </FormLabel>
                                    <FormDescription>
                                        Enable copy on select or not.
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
                    <FormField
                        control={form.control}
                        name="cursorBlink"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Cursor Blink
                                    </FormLabel>
                                    <FormDescription>
                                        Enable cursor blink or not.
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
                </div>
                <FormField
                    control={form.control}
                    name="cursorStyle"
                    render={({ field }) => (
                        <FormItem className="w-[200px]">
                            <FormLabel>Cursor Style</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a cursor style" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {cursorStyleOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fontSize"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Font Size</FormLabel>
                            <FormControl>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            form.setValue(
                                                'fontSize',
                                                form.getValues('fontSize') - 1
                                            )
                                        }
                                    >
                                        <MinusCircle />
                                    </Button>
                                    <Input
                                        placeholder="Your token"
                                        {...field}
                                        className="w-[60px] text-center"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            form.setValue(
                                                'fontSize',
                                                form.getValues('fontSize') + 1
                                            )
                                        }
                                    >
                                        <PlusCircle />
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fontFamily"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Font Family</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Your font family"
                                    {...field}
                                    className="w-[200px]"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fontWeight"
                    render={({ field }) => (
                        <FormItem className="w-[200px]">
                            <FormLabel>Font Weight</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a font weight" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fontWeightOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="background"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Background</FormLabel>
                            <FormControl>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="background"
                                        {...field}
                                        style={{
                                            backgroundColor:
                                                form.getValues('background'),
                                        }}
                                        className="w-[200px]"
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="secondary">
                                                Picker
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit">
                                            <HexColorPicker
                                                color={form.getValues(
                                                    'background'
                                                )}
                                                onChange={(color) =>
                                                    form.setValue(
                                                        'background',
                                                        color
                                                    )
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="foreground"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Foreground</FormLabel>
                            <FormControl>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="foreground"
                                        {...field}
                                        style={{
                                            color: form.getValues('foreground'),
                                        }}
                                        className="w-[200px]"
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="secondary">
                                                Picker
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit">
                                            <HexColorPicker
                                                color={form.getValues(
                                                    'foreground'
                                                )}
                                                onChange={(color) =>
                                                    form.setValue(
                                                        'foreground',
                                                        color
                                                    )
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="selectionBackground"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Background</FormLabel>
                            <FormControl>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="selection background"
                                        {...field}
                                        style={{
                                            backgroundColor: form.getValues(
                                                'selectionBackground'
                                            ),
                                        }}
                                        className="w-[200px]"
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="secondary">
                                                Picker
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit">
                                            <HexColorPicker
                                                color={form.getValues(
                                                    'foreground'
                                                )}
                                                onChange={(color) =>
                                                    form.setValue(
                                                        'selectionBackground',
                                                        color
                                                    )
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="selectionForeground"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Foreground</FormLabel>
                            <FormControl>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="selection foreground"
                                        {...field}
                                        style={{
                                            color: form.getValues(
                                                'selectionForeground'
                                            ),
                                        }}
                                        className="w-[200px]"
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="secondary">
                                                Picker
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-fit">
                                            <HexColorPicker
                                                color={form.getValues(
                                                    'foreground'
                                                )}
                                                onChange={(color) =>
                                                    form.setValue(
                                                        'selectionForeground',
                                                        color
                                                    )
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <LoadingBtn type="submit">Update Terminal</LoadingBtn>
            </form>
        </Form>
    )
}

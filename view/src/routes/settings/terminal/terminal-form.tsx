import { useEffect, useRef } from 'react'
import {
    cursorStyleOptions,
    terminalFormSchema,
    TerminalFormValues,
} from '@/routes/settings/terminal/schema.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { MinusCircle, Palette, PlusCircle } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { useForm } from 'react-hook-form'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

import { useLoadingBtn } from '@/hooks/useLoadingBtn'
import { useTerminalSettings } from '@/hooks/useTerminalSettings.tsx'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { toast } from '@/components/ui/use-toast.ts'

import './index.css'

import { cn } from '@/lib/utils.ts'

export function TerminalForm({
    className,
    onSubmit: onSubmitFn,
}: {
    className?: string
    onSubmit?: () => void
}) {
    const { terminalSettings, setTerminalSettings, restoreDefault } =
        useTerminalSettings()
    const { LoadingBtn, setIsLoading: setIsBtnLoading } = useLoadingBtn()

    const form = useForm<TerminalFormValues>({
        resolver: zodResolver(terminalFormSchema),
        defaultValues: {
            ...terminalSettings,
        },
    })

    const terminalDivRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!terminalDivRef.current) return
        const terminal = new Terminal({
            cursorBlink: form.getValues('cursorBlink'),
            cursorStyle: form.getValues('cursorStyle') as
                | 'block'
                | 'underline'
                | 'bar'
                | undefined,
            fontSize: form.getValues('fontSize'),
            theme: {
                background: form.getValues('background'),
                selectionBackground: form.getValues('selectionBackground'),
                selectionForeground: form.getValues('selectionForeground'),
                foreground: form.getValues('foreground'),
            },
            fontFamily: form.getValues('fontFamily'),
        })
        terminal.open(terminalDivRef.current!)
        const fitAddon = new FitAddon()
        terminal.loadAddon(fitAddon)
        fitAddon.fit()
        terminal.writeln('Hello from ServerBee $ ')
        terminal.writeln('This is selected line')
        terminal.write('Hello from ServerBee $ ')
        terminal.select(0, 1, 21)
        return () => {
            terminal.clear()
            terminal.dispose()
        }
    }, [form, form.formState])

    useEffect(() => {
        if (form.formState.isDirty) return
        form.setValue('copyOnSelect', terminalSettings?.copyOnSelect ?? true)
        form.setValue('cursorBlink', terminalSettings?.cursorBlink ?? true)
        form.setValue('cursorStyle', terminalSettings?.cursorStyle)
        form.setValue('fontSize', terminalSettings?.fontSize ?? 14)
        form.setValue('fontFamily', terminalSettings?.fontFamily)
        form.setValue('background', terminalSettings?.background)
        form.setValue('foreground', terminalSettings?.foreground)
        form.setValue(
            'selectionBackground',
            terminalSettings?.selectionBackground
        )
        form.setValue(
            'selectionForeground',
            terminalSettings?.selectionForeground
        )
    }, [form, terminalSettings])

    function onSubmit(data: TerminalFormValues) {
        setIsBtnLoading(true)
        try {
            setTerminalSettings(data)
            toast({
                title: 'Update Successfully',
            })
        } catch (e) {
            console.error(e)
            toast({
                title: 'Update Error',
                description: 'Please check console for more details.',
                variant: 'destructive',
            })
        }
        setIsBtnLoading(false)
        onSubmitFn?.()
    }

    return (
        <div className="relative w-full space-y-8">
            <div
                className={cn(
                    'sticky top-[65px] z-[100] w-full rounded-lg p-2',
                    className
                )}
                style={{ backgroundColor: form.getValues('background') }}
            >
                <div
                    id="terminal-preview"
                    ref={terminalDivRef}
                    className="h-[150px] w-[calc(100vw-64px-1rem)] lg:w-full"
                ></div>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="fontSize"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-col justify-start space-y-2 md:flex-row md:items-center md:justify-between">
                                    <FormLabel>Font Size</FormLabel>
                                    <FormControl>
                                        <div
                                            className="flex space-x-2"
                                            style={{ marginTop: 0 }}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={() => {
                                                    form.setValue(
                                                        'fontSize',
                                                        form.getValues(
                                                            'fontSize'
                                                        ) - 1
                                                    )
                                                    form.trigger()
                                                }}
                                            >
                                                <MinusCircle className="stroke-slate-500 dark:stroke-slate-300" />
                                            </Button>
                                            <Input
                                                placeholder="Your token"
                                                {...field}
                                                className="w-[60px] text-center"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={() => {
                                                    form.setValue(
                                                        'fontSize',
                                                        form.getValues(
                                                            'fontSize'
                                                        ) + 1
                                                    )
                                                    form.trigger()
                                                }}
                                            >
                                                <PlusCircle className="stroke-slate-500 dark:stroke-slate-300" />
                                            </Button>
                                        </div>
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cursorStyle"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Cursor Style</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        {cursorStyleOptions.map((option) => (
                                            <FormItem
                                                key={option}
                                                className="flex items-center space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={option}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {option}
                                                </FormLabel>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
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
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="background"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-col justify-start space-y-2 md:flex-row md:items-center md:justify-between">
                                    <FormLabel>Background</FormLabel>
                                    <FormControl>
                                        <div
                                            className="flex space-x-2"
                                            style={{ marginTop: 0 }}
                                        >
                                            <Input
                                                placeholder="background"
                                                {...field}
                                                style={{
                                                    color: form.getValues(
                                                        'foreground'
                                                    ),
                                                    backgroundColor:
                                                        form.getValues(
                                                            'background'
                                                        ),
                                                }}
                                                className="w-[200px]"
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                    >
                                                        <Palette />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-fit">
                                                    <HexColorPicker
                                                        color={form.getValues(
                                                            'background'
                                                        )}
                                                        onChange={(color) => {
                                                            form.setValue(
                                                                'background',
                                                                color
                                                            )
                                                            form.trigger()
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="foreground"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-col justify-start space-y-2 md:flex-row md:items-center md:justify-between">
                                    <FormLabel>Foreground</FormLabel>
                                    <FormControl>
                                        <div
                                            className="flex space-x-2"
                                            style={{ marginTop: 0 }}
                                        >
                                            <Input
                                                placeholder="foreground"
                                                {...field}
                                                style={{
                                                    color: form.getValues(
                                                        'foreground'
                                                    ),
                                                    backgroundColor:
                                                        form.getValues(
                                                            'background'
                                                        ),
                                                }}
                                                className="w-[200px]"
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                    >
                                                        <Palette />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-fit">
                                                    <HexColorPicker
                                                        color={form.getValues(
                                                            'foreground'
                                                        )}
                                                        onChange={(color) => {
                                                            form.setValue(
                                                                'foreground',
                                                                color
                                                            )
                                                            form.trigger()
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="selectionBackground"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-col justify-start space-y-2 md:flex-row md:items-center md:justify-between">
                                    <FormLabel>Selection Background</FormLabel>
                                    <FormControl>
                                        <div
                                            className="flex space-x-2"
                                            style={{ marginTop: 0 }}
                                        >
                                            <Input
                                                placeholder="selection background"
                                                {...field}
                                                style={{
                                                    color: form.getValues(
                                                        'selectionForeground'
                                                    ),
                                                    backgroundColor:
                                                        form.getValues(
                                                            'selectionBackground'
                                                        ),
                                                }}
                                                className="w-[200px]"
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                    >
                                                        <Palette />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-fit">
                                                    <HexColorPicker
                                                        color={form.getValues(
                                                            'foreground'
                                                        )}
                                                        onChange={(color) => {
                                                            form.setValue(
                                                                'selectionBackground',
                                                                color
                                                            )
                                                            form.trigger()
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="selectionForeground"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-col justify-start space-y-2 md:flex-row md:items-center md:justify-between">
                                    <FormLabel>Selection Foreground</FormLabel>
                                    <FormControl>
                                        <div
                                            className="flex space-x-2"
                                            style={{ marginTop: 0 }}
                                        >
                                            <Input
                                                placeholder="selection foreground"
                                                {...field}
                                                style={{
                                                    color: form.getValues(
                                                        'selectionForeground'
                                                    ),
                                                    backgroundColor:
                                                        form.getValues(
                                                            'selectionBackground'
                                                        ),
                                                }}
                                                className="w-[200px]"
                                            />
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                    >
                                                        <Palette />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-fit">
                                                    <HexColorPicker
                                                        color={form.getValues(
                                                            'foreground'
                                                        )}
                                                        onChange={(color) => {
                                                            form.setValue(
                                                                'selectionForeground',
                                                                color
                                                            )
                                                            form.trigger()
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                    <div className="flex space-x-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                restoreDefault()
                                form.setValue(
                                    'fontSize',
                                    terminalSettings?.fontSize ?? 14
                                )
                                form.trigger()
                            }}
                        >
                            Rest
                        </Button>
                        <LoadingBtn type="submit">Update Terminal</LoadingBtn>
                    </div>
                </form>
            </Form>
        </div>
    )
}

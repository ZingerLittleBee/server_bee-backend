import * as z from 'zod'

export const cursorStyleOptions = ['block', 'underline', 'bar']

export const terminalFormSchema = z.object({
    copyOnSelect: z.boolean(),
    cursorBlink: z.boolean(),
    cursorStyle: z.enum(cursorStyleOptions as [string, ...string[]]).optional(),
    fontSize: z.number().min(4).max(40),
    fontFamily: z.string().optional(),
    background: z.string().optional(),
    foreground: z.string().optional(),
    selectionBackground: z.string().optional(),
    selectionForeground: z.string().optional(),
})

export type TerminalFormValues = z.infer<typeof terminalFormSchema>

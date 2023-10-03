import { TerminalFormValues } from '@/routes/settings/terminal/schema.ts'
import { useLocalStorageState } from 'ahooks'

export const useTerminalSettings = () => {
    const [value, setValue] = useLocalStorageState<
        TerminalFormValues | undefined
    >('terminal-settings', {
        defaultValue: {
            copyOnSelect: true,
            fontSize: 14,
            fontFamily: '',
            cursorBlink: true,
            foreground: '#FFFFFF',
            background: '#141729',
            selectionBackground: '#01CC74',
            selectionForeground: '#1f563c',
        },
    })

    return {
        terminalSettings: value,
        setTerminalSettings: setValue,
    }
}

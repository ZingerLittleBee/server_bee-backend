import { TerminalFormValues } from '@/routes/settings/terminal/schema.ts'
import { useLocalStorageState } from 'ahooks'

const defaultTerminalSettings: TerminalFormValues = {
    copyOnSelect: true,
    fontSize: 14,
    fontFamily: 'FiraCode Nerd Font Mono',
    cursorBlink: true,
    foreground: '#FFFFFF',
    background: '#141729',
    selectionBackground: '#01CC74',
    selectionForeground: '#1f563c',
}

export const useTerminalSettings = () => {
    const [value, setValue] = useLocalStorageState<
        TerminalFormValues | undefined
    >('terminal-settings', {
        defaultValue: defaultTerminalSettings,
    })

    const restoreDefault = () => {
        setValue(defaultTerminalSettings)
    }

    return {
        terminalSettings: value,
        setTerminalSettings: setValue,
        restoreDefault,
    }
}

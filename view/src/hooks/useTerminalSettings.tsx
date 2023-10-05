import { useStore } from '@/store'
import { kRestoreTerminal, kSetTerminal } from '@/store/terminal.ts'

import { TerminalSettings } from '@/types/settings.ts'

export const useTerminalSettings = () => {
    const { terminal, terminalDispatch } = useStore()

    const setTerminalSettings = (value: TerminalSettings) => {
        terminalDispatch({
            type: kSetTerminal,
            payload: value,
        })
    }

    const restoreDefault = () => {
        terminalDispatch({
            type: kRestoreTerminal,
        })
    }

    return {
        terminalSettings: terminal,
        setTerminalSettings,
        restoreDefault,
    }
}

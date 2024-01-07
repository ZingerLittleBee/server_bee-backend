import { Dispatch } from 'react'
import { kTerminalSettings } from '@/const.ts'

import { TerminalSettings } from '@/types/settings.ts'

export const kSetTerminal = 'SET_TERMINAL'
export const kRestoreTerminal = 'RESTORE_TERMINAL'

export const defaultTerminalSettings: TerminalSettings = {
    copyOnSelect: true,
    fontSize: 14,
    cursorStyle: 'block',
    cursorBlink: true,
    foreground: '#FFFFFF',
    background: '#141729',
    selectionForeground: '#1f563c',
    selectionBackground: '#01CC74',
}

export type TerminalState = TerminalSettings

export interface SetTerminalAction {
    type: typeof kSetTerminal
    payload: TerminalState
}

export interface RestoreTerminalAction {
    type: typeof kRestoreTerminal
}

export type TerminalAction = SetTerminalAction | RestoreTerminalAction

export interface TerminalContext {
    terminal: TerminalState
    terminalDispatch: Dispatch<TerminalAction>
}

export const terminalReducer = (
    state: TerminalState,
    action: TerminalAction
): TerminalState => {
    switch (action.type) {
        case kSetTerminal:
            localStorage.setItem(
                kTerminalSettings,
                JSON.stringify(action.payload)
            )
            return {
                ...state,
                ...action.payload,
            }
        case kRestoreTerminal:
            localStorage.setItem(
                kTerminalSettings,
                JSON.stringify(defaultTerminalSettings)
            )
            return defaultTerminalSettings
        default:
            return state
    }
}

import { Dispatch } from 'react'

import { Settings } from '@/types/settings'

export const kSetSettings = 'SET_SETTINGS'

export type SettingsState = Settings

export interface SettingsAction {
    type: typeof kSetSettings
    payload: Settings
}

export interface SettingsContext {
    settings: SettingsState
    settingsDispatch: Dispatch<SettingsAction>
}

export const settingsReducer = (
    state: SettingsState,
    action: SettingsAction
): SettingsState => {
    switch (action.type) {
        case kSetSettings:
            return {
                ...state,
                ...action.payload,
            }
        default:
            return state
    }
}

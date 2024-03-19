import React from 'react'

export const kSetCommunicationToken = 'SET_COMMUNICATION_TOKEN'
export const kSetIsVerified = 'SET_IS_VERIFIED'

export interface TokenState {
    communicationToken?: string
    isVerified?: boolean
}

export type TokenAction = SetTokenAction | SetIsVerifiedAction

interface SetTokenAction {
    type: typeof kSetCommunicationToken
    payload: string
}

interface SetIsVerifiedAction {
    type: typeof kSetIsVerified
    payload: boolean
}

export interface TokenContext {
    token: TokenState
    tokenDispatch: React.Dispatch<TokenAction>
}

export const tokenReducer = (
    state: TokenState,
    action: TokenAction
): TokenState => {
    switch (action.type) {
        case kSetIsVerified:
            return {
                ...state,
                isVerified: action.payload,
            }
        case kSetCommunicationToken:
            return {
                ...state,
                communicationToken: action.payload,
            }
        default:
            return state
    }
}

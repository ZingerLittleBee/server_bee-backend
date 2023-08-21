import React from "react";

export const kSetCommunicationToken = 'SET_COMMUNICATION_TOKEN'

export interface TokenState {
    communicationToken?: string
}

export interface TokenAction {
    type: typeof kSetCommunicationToken
    payload: string
}

export interface TokenContext {
    token: TokenState,
    tokenDispatch: React.Dispatch<TokenAction>
}

export const tokenReducer = (state: TokenState, action: TokenAction): TokenState => {
    switch (action.type) {
        case kSetCommunicationToken:
            return {
                ...state,
                communicationToken: action.payload
            }
        default:
            return state
    }
}



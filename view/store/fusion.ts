import {Fusion} from "@/types/fusion";
import React from "react";

export const kSetFusion = 'SET_FUSION'

export type FusionState = Fusion

export interface FusionAction {
    type: typeof kSetFusion
    payload: FusionState
}

export interface FusionContext {
    fusion: FusionState,
    fusionDispatch: React.Dispatch<FusionAction>
}

export const fusionReducer = (state: FusionState, action: FusionAction): FusionState => {
    switch (action.type) {
        case kSetFusion:
            return {
                ...state,
                ...action.payload
            }
        default:
            return state
    }
}



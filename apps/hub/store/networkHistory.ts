import { type ImmerStateCreator } from '@/store/index'
import { type NetworkIO } from '@serverbee/types'

type networkHistoriesType = {
    serverId: string
    networks: NetworkIO[]
}

type State = {
    networkHistories: networkHistoriesType[]
}

type Action = {
    addNetworkHistory: (
        network: {
            serverId: string
            network: NetworkIO
        }[]
    ) => void
}

export type NetworkHistorySlice = State & Action

export const createNetworkHistorySlice: ImmerStateCreator<
    NetworkHistorySlice
> = (set) => ({
    networkHistories: [],
    addNetworkHistory: (networks) =>
        set((state) => {
            networks?.forEach((network) => {
                const index = state.networkHistories.findIndex(
                    (rec) => rec.serverId === network.serverId
                )
                if (index > -1) {
                    if (
                        (state.networkHistories[index]?.networks?.length ?? 0) >
                        5
                    ) {
                        state.networkHistories[index]?.networks.shift()
                    }
                    state.networkHistories[index]?.networks.push(
                        network.network
                    )
                } else {
                    state.networkHistories.push({
                        serverId: network.serverId,
                        networks: [network.network],
                    })
                }
            })
        }, true),
})

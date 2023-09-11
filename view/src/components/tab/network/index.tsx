import { useMemo, useState } from 'react'
import { useStore } from '@/store'

import NetworkDetail from '@/components/tab/network/detail.tsx'
import Selector from '@/components/tab/selector.tsx'

export default function NetworkTabView() {
    const { fusion } = useStore()

    const data = useMemo(() => {
        return fusion.realtime?.network?.map((net, index) => ({
            group: {
                value: `${net.name}-${index}`.toLowerCase(),
                label: net.name,
            },
            network: {
                id: `${net.name}-${index}`.toLowerCase(),
                packet: net.packet,
            },
        }))
    }, [fusion])

    const [value, setValue] = useState(data?.[0].group.value ?? '')

    const groups = data?.map((net) => net.group)
    const packet = data?.find((net) => net.network.id === value)?.network.packet
    const title = groups?.find((net) => net.value === value)?.label ?? ''

    return (
        <div className="space-y-4">
            {groups && (
                <Selector
                    subject="network"
                    value={value}
                    setValue={setValue}
                    groups={groups}
                ></Selector>
            )}
            {packet && <NetworkDetail title={title} packet={packet} />}
        </div>
    )
}

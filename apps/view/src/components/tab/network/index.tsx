import { useMemo, useState } from 'react'
import { useStore } from '@/store'

import NetworkDetail from '@/components/tab/network/detail.tsx'
import Selector from '@/components/tab/selector.tsx'

const sortKey = ['eth0', 'en0']

export default function NetworkTabView() {
    const { fusion } = useStore()

    const data = useMemo(() => {
        return fusion.realtime?.network
            ? [...fusion.realtime.network]
                  .sort(({ name: a }, { name: b }) => {
                      const aIndex = sortKey.includes(a)
                          ? sortKey.indexOf(a)
                          : sortKey.length
                      const bIndex = sortKey.includes(b)
                          ? sortKey.indexOf(b)
                          : sortKey.length
                      return aIndex - bIndex
                  })
                  .map((net, index) => ({
                      group: {
                          value: `${net.name}-${index}`.toLowerCase(),
                          label: net.name,
                      },
                      network: {
                          id: `${net.name}-${index}`.toLowerCase(),
                          packet: net.packet,
                      },
                  }))
            : []
    }, [fusion])

    const [value, setValue] = useState(data?.[0].group?.value ?? '')

    const groups = data?.map((net) => net.group)
    const packet = data?.find((net) => net.network.id === value)?.network.packet
    const title = groups?.find((net) => net.value === value)?.label ?? ''

    return (
        <div className="flex h-full flex-col space-y-4">
            {groups && (
                <Selector
                    subject="network"
                    value={value}
                    setValue={setValue}
                    groups={groups}
                ></Selector>
            )}
            {packet && (
                <NetworkDetail
                    className="flex-1"
                    title={title}
                    packet={packet}
                />
            )}
        </div>
    )
}

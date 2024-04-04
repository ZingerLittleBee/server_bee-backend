import { useMemo, useState } from 'react'
import { useStore } from '@/store'

import DiskDetail from '@/components/tab/disk/detail.tsx'
import Selector from '@/components/tab/selector.tsx'

export default function DiskTabView() {
    const { fusion } = useStore()

    const data = useMemo(() => {
        return fusion.realtime?.disk?.map((d, index) => ({
            group: {
                value: `${d.device_name}-${index}`.toLowerCase(),
                label: d.device_name,
            },
            disk: {
                id: `${d.device_name}-${index}`.toLowerCase(),
                detail: d,
            },
        }))
    }, [fusion])

    const [value, setValue] = useState(data?.[0].group?.value ?? '')

    const groups = data?.map((d) => d.group)
    const detail = data?.find((d) => d.disk.id === value)?.disk.detail

    return (
        <div className="space-y-4">
            {groups && (
                <Selector
                    subject="disk"
                    groups={groups}
                    value={value}
                    setValue={setValue}
                />
            )}
            {detail && <DiskDetail detail={detail} />}
        </div>
    )
}

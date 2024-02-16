'use client'

import useFilterServerList from '@/hooks/useFilterServerList'
import PanelCard, { PanelCardSkeleton } from '@/app/panel/components/card'
import FilterTool from '@/app/panel/components/filter/index'

export default function PanelPage() {
    const servers = useFilterServerList()
    return (
        <div className="grid">
            <FilterTool />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {servers?.map(({ id, name, record, status, networkHistory }) =>
                    record ? (
                        <PanelCard
                            key={id}
                            id={id}
                            name={name}
                            record={record}
                            status={status}
                            networkHistory={networkHistory}
                            className="w-full"
                        />
                    ) : (
                        <PanelCardSkeleton key={id} name={name} />
                    )
                )}
            </div>
        </div>
    )
}

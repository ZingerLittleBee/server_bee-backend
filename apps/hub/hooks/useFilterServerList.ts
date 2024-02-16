import { PanelFilter } from '@/constant/enum/filter'
import { StatusEnum } from '@/constant/enum/status'
import { useBoundStore } from '@/store'

import useServerList from '@/hooks/useServerList'

export default function useFilterServerList() {
    const serverList = useServerList()

    const panelFilter = useBoundStore.use.panelFilter()

    switch (panelFilter) {
        case PanelFilter.HasData:
            return serverList.filter((s) => s.record)
        case PanelFilter.OnlyOffline:
            return serverList.filter((s) => s.status === StatusEnum.Offline)
        case PanelFilter.OnlyOnline:
            return serverList.filter((s) => s.status === StatusEnum.Online)
        default:
            return serverList
    }
}

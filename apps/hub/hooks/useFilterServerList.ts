import { PanelFilter } from '@/constant/enum/filter'
import { StatusEnum } from '@/constant/enum/status'
import { usePersistStore } from '@/store/persist-store'

import useServerList from '@/hooks/useServerList'

export default function useFilterServerList() {
    const serverList = useServerList()

    const panelFilter = usePersistStore.use.panelFilter()

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

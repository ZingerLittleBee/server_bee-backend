import { fetchSettings } from '@/requests/settings'
import { useStore } from '@/store'
import useSWR from 'swr'

import { SettingsVo } from '@/types/settings'

export const useSettings = () => {
    const { token } = useStore()

    const { data, isLoading, error } = useSWR('/config', (url) =>
        fetchSettings(url, token.communicationToken)
    )

    return {
        settings: {
            webServer: data?.web_server,
            app: data?.app,
            server: {
                ...data?.server,
                disableSsl: data?.server.disable_ssl,
            },
        } as SettingsVo,
        isLoading,
        error,
    }
}

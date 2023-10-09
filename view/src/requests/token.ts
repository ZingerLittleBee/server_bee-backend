import instance from '@/requests/instance'

export const getToken = async () => {
    const { data } = await instance.get<string>('/local/token/view')
    return data
}

export const verifyToken = async (token: string) => {
    try {
        await instance.get('/check', {
            headers: {
                Authorization: token,
            },
        })
        return true
    } catch {
        return false
    }
}

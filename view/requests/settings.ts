import instance from "@/requests/instance";
import {Settings} from "@/types/settings";
import {Result} from "@/types/result";

export const fetchSettings = async (url: string, token?: string): Promise<Settings | undefined> => {
    const {data} = await instance.get<Result<Settings>>(
        url, {
            headers: {
                "Authorization": token
            }
        }
    )
    if (!data.success) throw new Error(data.message ?? 'Failed to fetch settings')
    return data.data
}

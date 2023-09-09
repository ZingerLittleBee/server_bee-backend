import instance from "@/requests/instance"

import { Result } from "@/types/result"
import {
  AppConfig,
  ServerConfig,
  Settings,
  WebServerConfig,
} from "@/types/settings"

export const fetchSettings = async (
  url: string,
  token?: string
): Promise<Settings | undefined> => {
  const { data } = await instance.get<Result<Settings>>(url, {
    headers: {
      Authorization: token,
    },
  })
  if (!data.success) throw new Error(data.message ?? "Failed to fetch settings")
  return data.data
}

export const updateGeneralSettings = async (
  settings: WebServerConfig,
  token?: string
) => {
  try {
    const { data } = await instance.post<Result>(
      "/config/webserver",
      settings,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    return data.success
  } catch {
    return false
  }
}

export const updateServerSettings = async (
  settings: ServerConfig,
  token?: string
) => {
  try {
    const { data } = await instance.post<Result>("/config/server", settings, {
      headers: {
        Authorization: token,
      },
    })
    return data.success
  } catch {
    return false
  }
}

export const updateSecuritySettings = async (
  settings: AppConfig,
  token?: string
) => {
  try {
    const { data } = await instance.post<Result>("/config/app", settings, {
      headers: {
        Authorization: token,
      },
    })
    return data.success
  } catch {
    return false
  }
}

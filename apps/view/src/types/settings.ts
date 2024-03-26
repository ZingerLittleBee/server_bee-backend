export type Settings = {
    web_server: WebServerConfig
    app: AppConfig
    server: ServerConfig
}

export type SettingsVo = {
    webServer: WebServerConfigVo
    app: AppConfigVo
    server: ServerConfigVo
}

export type WebServerConfig = {
    port: number
}

export type WebServerConfigVo = WebServerConfig

export type AppConfig = {
    token?: string
}

export type AppConfigVo = AppConfig

export type ServerConfig = {
    enableRecord?: boolean
    token?: string
    url?: string
    recordInterval?: number
}

export type ServerConfigVo = ServerConfig

export type TerminalSettings = {
    shell?: string
    copyOnSelect?: boolean
    fontSize?: number
    fontFamily?: string
    cursorStyle?: string
    cursorBlink?: boolean
    foreground?: string
    background?: string
    selectionBackground?: string
    selectionForeground?: string
}

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
    token?: string
    host?: string
    disable_ssl: boolean
}

export type ServerConfigVo = Omit<ServerConfig, 'disable_ssl'> & {
    disableSsl: boolean
}

export type TerminalSettings = {
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

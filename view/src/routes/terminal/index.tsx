import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { AttachAddon } from 'xterm-addon-attach'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from 'xterm-addon-search'
import { WebLinksAddon } from 'xterm-addon-web-links'

import './index.css'
import 'xterm/css/xterm.css'

import SearchWidget from '@/routes/terminal/search.tsx'

import { wsBaseUrl } from '@/lib/utils.ts'
import { useTerminalSettings } from '@/hooks/useTerminalSettings.tsx'

export default function TerminalPage() {
    const { terminalSettings } = useTerminalSettings()
    const terminalDivRef = useRef(null)
    const terminalRef = useRef<Terminal | null>(null)
    const searchAddonRef = useRef<SearchAddon | null>(null)

    useEffect(() => {
        if (!terminalDivRef.current) return
        const webSocket = new WebSocket(`${wsBaseUrl()}/pty?shell=zsh`)
        webSocket.binaryType = 'arraybuffer'
        const terminal = new Terminal({
            cursorBlink: terminalSettings?.cursorBlink,
            cursorStyle: terminalSettings?.cursorStyle as
                | 'block'
                | 'underline'
                | 'bar'
                | undefined,
            fontSize: terminalSettings?.fontSize,
            theme: {
                background: terminalSettings?.background,
                foreground: terminalSettings?.foreground,
                selectionBackground: terminalSettings?.selectionBackground,
                selectionForeground: terminalSettings?.selectionForeground,
            },
            fontFamily: 'FiraCode Nerd Font Mono',
        })
        terminalRef.current = terminal

        terminal.onResize(({ cols, rows }) => {
            webSocket.send(
                new Uint8Array([
                    0x37,
                    0x37,
                    (rows >> 8) & 0xff,
                    rows & 0xff,
                    (cols >> 8) & 0xff,
                    cols & 0xff,
                ])
            )
        })

        webSocket.onopen = () => {
            terminal.open(terminalDivRef.current!)
            const attachAddon = new AttachAddon(webSocket)
            const fitAddon = new FitAddon()
            const searchAddon = new SearchAddon()
            terminal.loadAddon(fitAddon)
            terminal.loadAddon(attachAddon)
            terminal.loadAddon(new WebLinksAddon())
            terminal.loadAddon(searchAddon)
            fitAddon.fit()
            searchAddonRef.current = searchAddon
        }

        webSocket.onclose = (reason) => {
            terminalRef.current?.write(
                '\r\nConnection closed. Please press Enter try reconnect \r\n'
            )
            console.log('WebSocket closed', reason)
        }

        return () => {
            webSocket.close()
            terminal.dispose()
        }
    }, [
        terminalSettings?.background,
        terminalSettings?.cursorBlink,
        terminalSettings?.cursorStyle,
        terminalSettings?.fontSize,
        terminalSettings?.foreground,
        terminalSettings?.selectionBackground,
        terminalSettings?.selectionForeground,
    ])

    return (
        <div className="flex h-full flex-col">
            <SearchWidget
                onSearch={(content: string) =>
                    searchAddonRef.current?.findNext(content)
                }
            />
            <div
                className="mt-2 h-[600px] rounded-lg p-2"
                style={{ backgroundColor: terminalSettings?.background }}
            >
                <div
                    id="terminal"
                    ref={terminalDivRef}
                    className="h-full"
                ></div>
            </div>
        </div>
    )
}

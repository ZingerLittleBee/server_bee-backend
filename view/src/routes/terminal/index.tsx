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

export default function TerminalPage() {
    const terminalDivRef = useRef(null)
    const terminalRef = useRef<Terminal | null>(null)
    const searchAddonRef = useRef<SearchAddon | null>(null)

    useEffect(() => {
        if (!terminalDivRef.current) return
        const webSocket = new WebSocket(`${wsBaseUrl()}/pty?shell=zsh`)
        webSocket.binaryType = 'arraybuffer'
        const terminal = new Terminal({
            cursorBlink: true,
            cursorStyle: 'block',
            fontSize: 14,
            fontWeight: 'normal',
            fontWeightBold: 'bold',
            lineHeight: 1,
            theme: {
                background: '#141729',
                // foreground: '#01CC74',
            },
            fontFamily: 'FiraCode Nerd Font Mono',
        })
        terminalRef.current = terminal

        terminal.onResize(({ cols, rows }) => {
            console.log('resize', cols, rows)
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
            console.log('WebSocket closed', reason)
        }

        return () => {
            webSocket.close()
            terminal.dispose()
        }
    }, [])

    return (
        <div className="flex h-full flex-col space-y-2">
            <SearchWidget
                onSearch={(content: string) =>
                    searchAddonRef.current?.findNext(content)
                }
            />
            <div id="terminal" ref={terminalDivRef} className=""></div>
        </div>
    )
}

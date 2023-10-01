import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { AttachAddon } from 'xterm-addon-attach'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

import './index.css'
import 'xterm/css/xterm.css'

import { wsBaseUrl } from '@/lib/utils.ts'

export default function TerminalPage() {
    const terminalRef = useRef(null)

    useEffect(() => {
        if (!terminalRef.current) return
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
            terminal.open(terminalRef.current!)
            const attachAddon = new AttachAddon(webSocket)
            const fitAddon = new FitAddon()
            terminal.loadAddon(fitAddon)
            terminal.loadAddon(attachAddon)
            terminal.loadAddon(new WebLinksAddon())
            fitAddon.fit()
        }

        webSocket.onclose = (reason) => {
            console.log('WebSocket closed', reason)
        }

        return () => {
            webSocket.close()
            terminal.dispose()
        }
    }, [])

    return <div id="terminal" ref={terminalRef} className="h-full"></div>
}

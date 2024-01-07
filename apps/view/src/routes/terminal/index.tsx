import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { AttachAddon } from 'xterm-addon-attach'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from 'xterm-addon-search'
import { WebLinksAddon } from 'xterm-addon-web-links'

import 'xterm/css/xterm.css'
import './index.css'

import { TerminalForm } from '@/routes/settings/terminal/terminal-form.tsx'
import SearchWidget from '@/routes/terminal/search.tsx'
import { Cog } from 'lucide-react'

import { wsBaseUrl } from '@/lib/utils.ts'
import { useTerminalSettings } from '@/hooks/useTerminalSettings.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet.tsx'
import WithAuth from '@/components/with_auth.tsx'

function TerminalPage() {
    const { terminalSettings } = useTerminalSettings()
    const terminalDivRef = useRef(null)
    const terminalRef = useRef<Terminal | null>(null)
    const searchAddonRef = useRef<SearchAddon | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!terminalDivRef.current) return
        const url = terminalSettings.shell
            ? `${wsBaseUrl()}/pty?shell=${terminalSettings.shell}`
            : `${wsBaseUrl()}/pty`
        const webSocket = new WebSocket(url)
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
            fontFamily: terminalSettings?.fontFamily,
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

        if (terminalSettings?.copyOnSelect) {
            terminal.onSelectionChange(() => {
                navigator.clipboard.writeText(terminal.getSelection())
            })
        }

        terminal.open(terminalDivRef.current!)

        const fitAddon = new FitAddon()
        const searchAddon = new SearchAddon()
        terminal.loadAddon(fitAddon)
        terminal.loadAddon(new WebLinksAddon())
        terminal.loadAddon(searchAddon)

        searchAddonRef.current = searchAddon

        const resizeFn = () => fitAddon.fit()
        window.addEventListener('resize', resizeFn)

        webSocket.onopen = () => {
            const attachAddon = new AttachAddon(webSocket)
            terminal.loadAddon(attachAddon)
            fitAddon.fit()
        }

        webSocket.onclose = (reason) => {
            terminalRef.current?.write(
                '\r\nConnection closed. Please \x1b[33mPress Enter\x1b[0m or \x1b[33mRefresh the Page\x1b[0m to attempt reconnection. \r\n'
            )
            console.log('WebSocket closed', reason)
        }

        return () => {
            webSocket.close()
            terminal.dispose()
            window.removeEventListener('resize', resizeFn)
        }
    }, [
        terminalSettings,
        terminalSettings?.background,
        terminalSettings?.copyOnSelect,
        terminalSettings?.cursorBlink,
        terminalSettings?.cursorStyle,
        terminalSettings?.fontSize,
        terminalSettings?.foreground,
        terminalSettings?.selectionBackground,
        terminalSettings?.selectionForeground,
    ])

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-row items-center justify-between">
                <SearchWidget
                    onSearch={(content: string) =>
                        searchAddonRef.current?.findNext(content)
                    }
                />
                <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
                    <SheetTrigger asChild>
                        <Button variant="secondary" size="icon">
                            <Cog />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-auto">
                        <SheetHeader>
                            <SheetTitle>Terminal</SheetTitle>
                            <SheetDescription>
                                Update your terminal settings.
                            </SheetDescription>
                        </SheetHeader>
                        <TerminalForm
                            className="top-0 sm:top-0"
                            onSubmit={() => setOpen(false)}
                        />
                    </SheetContent>
                </Sheet>
            </div>
            <div
                className="mt-2 h-full rounded-lg p-2"
                style={{ backgroundColor: terminalSettings?.background }}
            >
                <div
                    id="terminal"
                    className="h-full"
                    ref={terminalDivRef}
                ></div>
            </div>
        </div>
    )
}

export default WithAuth(TerminalPage)

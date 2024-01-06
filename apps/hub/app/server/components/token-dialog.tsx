'use client'

import { useState } from 'react'
import { useBoundStore } from '@/store'
import { CheckIcon, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type TokenDialogProps = {
    title: string
    description?: string
    tokens: string[]
}

export function TokenDialog() {
    const isOpen = useBoundStore.use.isOpenTokenDialog()
    const setIsOpen = useBoundStore.use.setIsOpenTokenDialog()
    const tokenDialogProps = useBoundStore.use.tokenDialogProps()
    const [copySuccess, setCopySuccess] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen={isOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{tokenDialogProps.title}</DialogTitle>
                    <DialogDescription>
                        {tokenDialogProps.description ??
                            'Copy the token to node and use it to connect to your server.'}
                    </DialogDescription>
                </DialogHeader>
                {tokenDialogProps.tokens.map((token, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            <Input id="link" defaultValue={token} readOnly />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className="px-3"
                            onClick={async () => {
                                await navigator.clipboard.writeText(token)
                                setCopySuccess(true)
                                setTimeout(() => {
                                    setCopySuccess(false)
                                }, 2000)
                            }}
                        >
                            <span className="sr-only">Copy</span>
                            {copySuccess ? (
                                <CheckIcon className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                ))}
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

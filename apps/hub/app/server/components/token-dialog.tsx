'use client'

import { useBoundStore } from '@/store'
import { api } from '@/trpc/react'
import { X } from 'lucide-react'

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
import CopyButton from '@/components/copy-button'
import { STooltip } from '@/components/s-tooltip'

export type TokenDialogProps = {
    title: string
    description?: string
    serverId: string
}

export function TokenDialog() {
    const isOpen = useBoundStore.use.isOpenTokenDialog()
    const setIsOpen = useBoundStore.use.setIsOpenTokenDialog()
    const tokenDialogProps = useBoundStore.use.tokenDialogProps()

    const { data: tokens, refetch } = api.serverToken.list.useQuery({
        id: tokenDialogProps.serverId,
    })

    const { mutateAsync: generateToken } = api.serverToken.create.useMutation()
    const { mutateAsync: deleteToken } = api.serverToken.delete.useMutation()

    const handleGenerateToken = async () => {
        await generateToken({ serverId: tokenDialogProps.serverId })
        await refetch()
    }

    const handleDeleteToken = async (token: string) => {
        await deleteToken({ token })
        await refetch()
    }

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
                {tokens?.map(({ token }, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            <Input id="link" defaultValue={token} readOnly />
                        </div>
                        <CopyButton content={token} />
                        <STooltip content="Delete Token">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDeleteToken(token)}
                            >
                                <span className="sr-only">Delete Token</span>
                                <X className="size-4" />
                            </Button>
                        </STooltip>
                    </div>
                ))}
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                    <Button onClick={handleGenerateToken}>Generate</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

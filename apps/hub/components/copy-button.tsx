import { useState } from 'react'
import { CheckIcon, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function CopyButton({ content }: { content: string }) {
    const [copySuccess, setCopySuccess] = useState(false)

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={async () => {
                await navigator.clipboard.writeText(content)
                setCopySuccess(true)
                setTimeout(() => {
                    setCopySuccess(false)
                }, 2000)
            }}
        >
            <span className="sr-only">Copy</span>
            {copySuccess ? (
                <CheckIcon className="size-4" />
            ) : (
                <Copy className="size-4" />
            )}
        </Button>
    )
}

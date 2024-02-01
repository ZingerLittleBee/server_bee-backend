import {
    type HTMLAttributes,
    type PropsWithChildren,
    type ReactNode,
} from 'react'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export function STooltip({
    children,
    content,
    className,
}: PropsWithChildren<
    Omit<HTMLAttributes<HTMLDivElement>, 'content'> & { content: ReactNode }
>) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent className={className}>{content}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

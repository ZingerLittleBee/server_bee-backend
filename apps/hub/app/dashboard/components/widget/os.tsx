import { unix } from 'dayjs'
import { Timer, UserSquare } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Icons } from '@/components/icons'
import useFusion from '@/app/dashboard/hooks/useFusion'

export const OsWidget = ({ className }: { className?: string }) => {
    const fusion = useFusion()
    const os = fusion?.os

    return (
        <div
            className={cn(
                'my-1 flex flex-col justify-between space-y-2 sm:flex-row sm:space-y-0',
                className
            )}
        >
            <div className="flex space-x-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <UserSquare size={16} />
                                {os?.hostname ? (
                                    <p>{os?.hostname}</p>
                                ) : (
                                    <Skeleton className="h-5 w-[100px]" />
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Hostname</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Icons.os className="w-[16px] fill-muted-foreground" />
                                {os?.os_version ? (
                                    <p>{os?.os_version}</p>
                                ) : (
                                    <Skeleton className="h-5 w-[100px]" />
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>OS</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild className="">
                        <div className="flex items-center justify-start space-x-2 text-sm text-muted-foreground sm:justify-end">
                            <Timer size={16} />
                            {os?.boot_time ? (
                                <p>
                                    {unix(os?.boot_time).format(
                                        'YYYY-MM-DD HH:mm:ss'
                                    )}
                                </p>
                            ) : (
                                <Skeleton className="h-5 w-[100px]" />
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Boot Time</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

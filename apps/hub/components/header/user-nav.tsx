import Link from 'next/link'
import { DISCUSSION_URL, ISSUE_URL } from '@/constant/github'
import { getServerAuthSession } from '@/server/auth'
import { Bug, Cloud, Github, LifeBuoy, LogOut } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export async function UserNav() {
    const session = await getServerAuthSession()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="size-9 cursor-pointer">
                    <AvatarImage alt="account" />
                    <AvatarFallback>{session?.user.username}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {session?.user.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session?.user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuItem>
                    <Github className="mr-2 size-4" />
                    <span>GitHub</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link
                        href={ISSUE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center"
                    >
                        <Bug className="mr-2 size-4" />
                        <span>Bug</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link
                        href={DISCUSSION_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center"
                    >
                        <LifeBuoy className="mr-2 size-4" />
                        <span>Support</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <Cloud className="mr-2 size-4" />
                    <span>API</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="focus:bg-transparent">
                    <Link
                        href="/api/auth/signout"
                        rel="noreferrer"
                        className={cn(
                            'w-full',
                            buttonVariants({
                                variant: 'outline',
                            })
                        )}
                    >
                        <LogOut className="mr-2 size-4" />
                        <span>Log out</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

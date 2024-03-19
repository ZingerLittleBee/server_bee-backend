import { MoreHorizontal } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link } from 'react-router-dom'

import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils.ts'
import { buttonVariants } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { MainNav } from '@/components/main-nav'
import { ThemeToggle } from '@/components/theme-toggle'

const MoreView = () => {
    const { setTheme, theme } = useTheme()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    className={cn(
                        buttonVariants({
                            size: 'sm',
                            variant: 'ghost',
                        }),
                        'cursor-pointer'
                    )}
                >
                    <MoreHorizontal className="h-5 w-5" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit">
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Link
                            draggable="false"
                            to={siteConfig.links.github}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center"
                        >
                            <Icons.gitHub className="mr-2 h-4 w-4" />
                            <span>Github</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link
                            draggable="false"
                            to={siteConfig.links.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center"
                        >
                            <Icons.twitter className="mr-2 h-4 w-4 fill-current" />
                            <span>Twitter</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            setTheme(theme === 'light' ? 'dark' : 'light')
                        }
                    >
                        <Icons.sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Icons.moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>
                            {theme
                                ? theme?.charAt(0).toUpperCase() +
                                  theme?.slice(1)
                                : ''}
                        </span>
                        <span className="sr-only">Toggle theme</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 flex min-h-[4rem] w-full border-b bg-background">
            <div className="container flex h-full items-center space-x-4 sm:justify-between sm:space-x-0">
                <MainNav items={Object.values(siteConfig.mainNav)} />
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-1">
                        <div className="block sm:hidden">
                            <MoreView />
                        </div>
                        <Link
                            draggable="false"
                            to={siteConfig.links.github}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:block"
                        >
                            <div
                                className={buttonVariants({
                                    size: 'sm',
                                    variant: 'ghost',
                                })}
                            >
                                <Icons.gitHub className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </div>
                        </Link>
                        <Link
                            draggable="false"
                            to={siteConfig.links.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:block"
                        >
                            <div
                                className={buttonVariants({
                                    size: 'sm',
                                    variant: 'ghost',
                                })}
                            >
                                <Icons.twitter className="h-5 w-5 fill-current" />
                                <span className="sr-only">Twitter</span>
                            </div>
                        </Link>
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}

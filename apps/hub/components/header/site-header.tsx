import Link from 'next/link'
import { getServerAuthSession } from '@/server/auth'

import { siteConfig } from '@/config/site'
import { buttonVariants } from '@/components/ui/button'
import { MainNav } from '@/components/header/main-nav'
import ServerSelect from '@/components/header/server-select'
import { UserNav } from '@/components/header/user-nav'
import { Icons } from '@/components/icons'
import { ThemeToggle } from '@/components/theme-toggle'

export async function SiteHeader() {
    const session = await getServerAuthSession()

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
                <div className="flex items-center gap-4">
                    <MainNav items={Object.values(siteConfig.mainNav)} />
                    <ServerSelect />
                </div>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-1">
                        <Link
                            href={siteConfig.links.github}
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
                                <Icons.gitHub className="size-5" />
                                <span className="sr-only">GitHub</span>
                            </div>
                        </Link>
                        <Link
                            href={siteConfig.links.twitter}
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
                                <Icons.twitter className="size-5 fill-current" />
                                <span className="sr-only">Twitter</span>
                            </div>
                        </Link>
                        <ThemeToggle />
                        {session ? (
                            <UserNav />
                        ) : (
                            <Link
                                href="/api/auth/signin"
                                rel="noreferrer"
                                className={buttonVariants({
                                    size: 'sm',
                                    variant: 'ghost',
                                })}
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}

'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

import { Button } from '@/components/ui/button'

export default function SignOutPage() {
    return (
        <Button
            variant="outline"
            className="w-full max-w-[200px] m-auto"
            onClick={() => signOut()}
        >
            <LogOut className="mr-2 size-4" />
            <span>Log out</span>
        </Button>
    )
}

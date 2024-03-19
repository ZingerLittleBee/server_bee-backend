import { useState, type HTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/ui/input'

export default function InputPassword(props: HTMLAttributes<HTMLInputElement>) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="relative h-full">
            <Input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className="pr-8"
            />
            <div
                className="absolute right-3 top-1/2 translate-y-[-50%] cursor-pointer text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </div>
        </div>
    )
}

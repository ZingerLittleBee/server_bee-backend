import { useState } from 'react'
import { kCommunicationToken } from '@/const'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useToken } from '@/hooks/useToken'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

export default function LoginPage() {
    const { verify } = useToken()
    const [showPassword, setShowPassword] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [checked, setChecked] = useState(true)
    const router = useNavigate()

    const handleConfirm = async () => {
        const value = inputValue.trim()
        const res = await verify(value)
        if (res) {
            if (checked) {
                localStorage.setItem(kCommunicationToken, value)
            }
            toast({
                title: 'Verify success',
            })
            router('/')
        } else {
            toast({
                variant: 'destructive',
                title: 'Verify failed',
                description: 'please check your token and try again.',
            })
        }
    }

    return (
        <div className="mx-auto flex h-full w-full flex-col items-center justify-center space-y-6 sm:max-w-[300px]">
            <div className="relative flex w-full items-center">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Token"
                />
                {showPassword ? (
                    <EyeOff
                        className="absolute right-2 cursor-pointer text-muted-foreground"
                        size={20}
                        onClick={() => setShowPassword(false)}
                    />
                ) : (
                    <Eye
                        className="absolute right-2 cursor-pointer  text-muted-foreground"
                        size={20}
                        onClick={() => setShowPassword(true)}
                    />
                )}
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="remember me"
                    checked={checked}
                    onCheckedChange={(state) => setChecked(!!state)}
                />
                <label
                    htmlFor="remember me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Remember me
                </label>
            </div>
            <Button className="w-full" type="submit" onClick={handleConfirm}>
                Confirm
            </Button>
        </div>
    )
}

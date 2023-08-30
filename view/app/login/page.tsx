"use client"

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import {Checkbox} from "@/components/ui/checkbox";
import {useToken} from "@/hooks/useToken";
import {toast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const {verify} = useToken()
    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState("")
    const [checked, setChecked] = useState(false)
    const router = useRouter()

    const handleConfirm = async () => {
        const res = await verify(inputValue)
        if (res) {
            if (checked) {
                localStorage.setItem("token", inputValue)
            }
            toast({
                title: "Verify success"
            })
            router.push("/")
        } else {
            toast({
                    variant: "destructive",
                    title: "Verify failed",
                    description: "please check your token and try again."
                }
            )
        }
    }

    return (
        <div
            className="mx-auto flex w-full sm:max-w-[300px] h-full flex-col justify-center items-center space-y-6">
            <div className="w-full relative flex items-center">
                <Input type={showPassword ? "text" : "password"}
                       value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}
                       placeholder="Token"/>
                {showPassword ?
                    <EyeOff className="absolute right-2 cursor-pointer text-muted-foreground"
                            onClick={() => setShowPassword(false)}/> :
                    <Eye className="absolute right-2 cursor-pointer  text-muted-foreground"
                         onClick={() => setShowPassword(true)}/>}
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="remember me"
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
            <Button className="w-full" type="submit"
                    onClick={handleConfirm}
            >Confirm</Button>
        </div>
    )
}

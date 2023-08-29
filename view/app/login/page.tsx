"use client"

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {Eye, EyeOff} from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div
            className="mx-auto flex w-full h-full flex-col justify-center space-y-6">
            <div
                className="flex sm:flex-row w-full items-center space-x-2 space-y-2 sm:space-y-0 justify-center flex-col">
                <div className="relative flex items-center w-full sm:max-w-[300px]">
                    <Input type={showPassword ? "text" : "password"}
                           placeholder="Token"/>
                    {showPassword ?
                        <Eye className="absolute right-2 cursor-pointer" onClick={() => setShowPassword(false)}/> :
                        <EyeOff className="absolute right-2 cursor-pointer" onClick={() => setShowPassword(true)}/>}
                </div>
                <Button className="w-full sm:w-auto" type="submit">Confirm</Button>
            </div>
        </div>
    )
}

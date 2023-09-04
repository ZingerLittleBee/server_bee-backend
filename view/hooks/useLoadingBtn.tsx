import {useState, ReactNode, ButtonHTMLAttributes} from "react";
import {Button} from "@/components/ui/button";
import { Icons } from "@/components/icons";

export type LoadingBtnProps = {
    children: ReactNode
    onClick?: () => void
} & ButtonHTMLAttributes<HTMLButtonElement>

export const useLoadingBtn = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const LoadingBtn = ({children, ...props}: LoadingBtnProps) => {
        return <Button
            type="button"
            disabled={isLoading}
            {...props}
        >
            {isLoading && (<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />)}
            {children}
        </Button>
    }

    return {
        isLoading,
        setIsLoading,
        LoadingBtn
    }
}

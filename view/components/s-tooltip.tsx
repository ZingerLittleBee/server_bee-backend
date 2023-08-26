import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {ReactNode} from "react";

interface STooltipProps {
  content: ReactNode
  children: ReactNode
}

export function STooltip({children, content}: STooltipProps) {
  return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent>
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  )
}

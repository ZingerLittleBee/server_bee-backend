import { Bold, Flex, Text } from '@tremor/react'
import { Info } from 'lucide-react'

import { STooltip } from '@/components/s-tooltip'

export enum InfoColorEnum {
    Violet = 'bg-[#8b5cf6]',
    Green = 'bg-[#22c55e]',
    Teal = 'bg-[#14b8a6]',
    Fuchsia = 'bg-[#d946ef]',
    Emerald = 'bg-[#10b981]',
    Amber = 'bg-[#f59e0b]',
}

export type InfoTooltipProps = {
    title?: string
    data: { key: string; value: string; color: InfoColorEnum }[]
}

export default function InfoTooltip({
    title = 'Total Usage',
    data,
}: InfoTooltipProps) {
    return (
        <STooltip
            content={
                <div>
                    <Text className="mx-2">{title}</Text>
                    <div className="bg-muted my-1 w-full border" />
                    {data?.map(({ key, value, color }) => (
                        <div
                            key={key}
                            className="mx-2 flex flex-row items-center space-x-2"
                        >
                            <div
                                className={`h-2 w-2 rounded-full ${color}`}
                            ></div>
                            <Flex
                                justifyContent="between"
                                alignItems="center"
                                className="gap-1"
                            >
                                <Text>{key}</Text>
                                <Bold>{value}</Bold>
                            </Flex>
                        </div>
                    ))}
                </div>
            }
            className="px-0"
        >
            <Info className="h-3 w-3 self-start text-slate-500" />
        </STooltip>
    )
}

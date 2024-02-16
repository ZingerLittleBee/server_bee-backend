import { PanelFilter } from '@/constant/enum/filter'
import { useBoundStore } from '@/store'
import { Flex } from '@tremor/react'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function FilterTool() {
    const panelOption = [
        {
            key: PanelFilter.All,
            label: 'all',
        },
        {
            key: PanelFilter.OnlyOnline,
            label: 'only online',
        },
        {
            key: PanelFilter.OnlyOffline,
            label: 'only offline',
        },
        {
            key: PanelFilter.HasData,
            label: 'has data',
        },
    ]

    const setPanelFilter = useBoundStore.use.setPanelFilter()

    return (
        <div className="py-3">
            <Flex className="w-auto" justifyContent="end">
                <RadioGroup
                    defaultValue={PanelFilter.All}
                    className="flex items-center gap-4"
                    onValueChange={(value) => {
                        setPanelFilter(value as PanelFilter)
                    }}
                >
                    {panelOption.map(({ key, label }) => (
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={key} id={label} />
                            <Label htmlFor={label}>{label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </Flex>
        </div>
    )
}

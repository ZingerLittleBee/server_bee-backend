'use client'

import { type Group } from '@/server/api/routers/group'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

export type GroupTabContentProps = {
    groups: Group[]
}

export default function GroupTabContent({ groups }: GroupTabContentProps) {
    return (
        <Accordion type="multiple" className="w-full">
            {groups?.map((g) => (
                <AccordionItem key={g.id} value={g.id}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="space-x-4">
                            <span className="hover:underline">{g.name}</span>
                            <span className="text-muted-foreground text-sm">
                                {g.description}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

'use client'

import { type RouterOutputs } from '@/trpc/shared'
import { Flex, Italic, Subtitle } from '@tremor/react'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

export type GroupTabContentProps = {
    groups: RouterOutputs['group']['list']
}

export default function GroupTabContent({ groups }: GroupTabContentProps) {
    return (
        <Accordion type="multiple" className="w-full">
            {groups?.map((group) => (
                <AccordionItem key={group.id} value={group.id}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="space-x-4">
                            <Badge variant="outline">
                                {group.servers.length ?? 0}
                            </Badge>
                            <span className="hover:underline">
                                {group.name}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                {group.description}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        {group.servers?.length > 0 ? (
                            group.servers?.map((server) => (
                                <Flex
                                    key={server.id}
                                    justifyContent="start"
                                    className="gap-4"
                                >
                                    <Badge variant="secondary">
                                        {server.name}
                                    </Badge>
                                    <Subtitle>{server.description}</Subtitle>
                                </Flex>
                            ))
                        ) : (
                            <Italic>No servers</Italic>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {useStore} from "@/store";
import {Badge} from "@/components/ui/badge";
import {Card as TremorCard, Text, Grid, Col, Bold, Italic} from "@tremor/react";

import {useMemo} from "react";
import {formatToString} from "@/lib/utils";
import {DiskIO} from "@/types/fusion";
import {STooltip} from "@/components/s-tooltip";
import {ScrollArea} from "../ui/scroll-area";
import dayjs, {unix} from "dayjs";
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(duration);
dayjs.extend(relativeTime)

export default function ProcessDetail() {
    const {fusion} = useStore()
    const process = fusion.current_process

    const data = useMemo(() => {
        return [{
            title: "PID",
            metric: process?.pid
        }, {
            title: "Parent ID",
            metric: process?.parent
        }, {
            title: "User",
            metric: process?.user
        }, {
            title: "CPU",
            metric: process?.cpu
        }, {
            title: "Memory",
            metric: formatToString(process?.memory)
        }, {
            title: "Swap",
            metric: formatToString(process?.vir_mem)
        }, {
            title: "Running Time",
            metric: dayjs.duration(parseInt(process?.run_time ?? '0'), "seconds").humanize()
        }, {
            title: "Boot Time",
            metric: unix(parseInt(process?.start_time ?? '0')).format('YYYY-MM-DD HH:mm:ss')
        }]
    }, [process])

    return process ?
        <ScrollArea className="h-[calc(100vh-65px-1rem-36px-40px-16px-20px)] w-full border rounded-lg">
            <Card className="h-full border-none shadow-none">
                <CardHeader
                    className="mb-6 px-6 py-1 rounded-t-lg sticky top-0 z-[100] flex flex-row justify-between items-center space-x-2 space-y-0 bg-muted">
                    <p className="text-lg font-bold">{process?.name}</p>
                    {process?.status && <Badge>{process?.status}</Badge>}
                </CardHeader>
                <CardContent>
                    <Grid numItems={3} numItemsSm={2} numItemsLg={3} className="gap-6">
                        {data.map((item) => (
                            <TremorCard key={item.title}>
                                <Text>{item.title}</Text>
                                <Bold>{item.metric}</Bold>
                            </TremorCard>
                        ))}
                        {
                            process?.disk && <Col numColSpan={3}>
                                <TremorCard>
                                    <Text>Disk</Text>
                                    <div className="flex justify-between">
                                        {
                                            process?.disk && ['read', 'write', 'total_read', 'total_write'].map((key) => {
                                                return <div className="">
                                                    <Text>{key}</Text>
                                                    <Bold>{formatToString(process?.disk[key as keyof DiskIO])}</Bold>
                                                </div>
                                            })
                                        }
                                    </div>
                                </TremorCard>
                            </Col>
                        }
                        {
                            process?.exe && <Col numColSpan={3}>
                                <TremorCard>
                                    <Text>Executable</Text>
                                    <STooltip content={process?.exe}>
                                        <p className="truncate font-bold">{process?.cmd}</p>
                                    </STooltip>
                                </TremorCard>
                            </Col>
                        }
                        {
                            process?.cmd?.length > 0 &&
                            <Col numColSpan={3}>
                                <TremorCard>
                                    <Text>Command</Text>
                                    {
                                        process?.cmd.map((cmd) => (
                                            <STooltip content={cmd}>
                                                <p className="truncate font-bold">{cmd}</p>
                                            </STooltip>
                                        ))
                                    }
                                </TremorCard>
                            </Col>
                        }
                        {
                            process?.environ?.length > 0 && <Col numColSpan={3}>
                                <TremorCard>
                                    <Text>Environ</Text>
                                    <ScrollArea className="h-64">
                                        {
                                            process?.environ.map((env) => {
                                                return <STooltip content={env}>
                                                    <p className="truncate font-bold">{env}</p>
                                                </STooltip>
                                            })
                                        }
                                    </ScrollArea>

                                </TremorCard>
                            </Col>
                        }
                    </Grid>
                </CardContent>
            </Card>
        </ScrollArea>
        : <NoDataView/>
}

const NoDataView = () => {
    return (<div className="h-full flex items-center space-x-2">
            <svg
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" className="animate-bounce w-6 h-6 ">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"/>
            </svg>

            <Text>Click</Text>
            <Italic>PID</Italic>
            <Text>column to view process detail</Text>
        </div>
    )
}

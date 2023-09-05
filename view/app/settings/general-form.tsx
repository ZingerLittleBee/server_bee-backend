import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Input} from "@/components/ui/input";
import {toast} from "@/components/ui/use-toast";
import {useSettings} from "@/hooks/useSettings";
import {useEffect, useMemo} from "react";
import {useToken} from "@/hooks/useToken";
import {updateGeneralSettings} from "@/requests/settings";
import {useLoadingBtn} from "@/hooks/useLoadingBtn";

const generalFormSchema = z.object({
    port: z.string().refine(value => {
        const num = parseInt(value, 10);
        return !isNaN(num) && num >= 0 && num <= 65535;
    }, {
        message: 'Port should be a number between 0 and 65535.',
    })
})

type GeneralFormValues = z.infer<typeof generalFormSchema>

export default function GeneralForm() {
    const {settings, isLoading} = useSettings()
    const { token } = useToken()
    const { LoadingBtn, setIsLoading: setIsBtnLoading } = useLoadingBtn()

    const webServer = useMemo(() => settings?.webServer, [settings])

    const form = useForm<GeneralFormValues>({
        resolver: zodResolver(generalFormSchema),
        defaultValues: {
            port: webServer?.port.toString() ?? '',
        }
    })

    async function onSubmit(data: GeneralFormValues) {
        setIsBtnLoading(true)
        const res = await updateGeneralSettings({
            port: parseInt(data.port, 10),
        }, token.communicationToken)
        if (res) {
            toast({
                title: "Update Successfully",
            })
        } else {
            toast({
                title: "Update Error",
                description: "Please check console for more details.",
                variant: "destructive"
            })
        }
        setIsBtnLoading(false)
    }

    useEffect(() => {
        if (form.formState.isDirty) return
        form.setValue("port", webServer?.port.toString() ?? '')
    }, [form, webServer])

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="port"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Port</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>This is app connect port.</FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <LoadingBtn type="submit">Update General</LoadingBtn>
            </form>
        </Form>
    )
}

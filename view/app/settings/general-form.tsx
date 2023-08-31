import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {Input} from "@/components/ui/input";
import {toast} from "@/components/ui/use-toast";

const generalFormSchema = z.object({
    port: z.number({
        description: "The port to run the server on."
    }).min(1).max(65535),
})

type GeneralFormValues = z.infer<typeof generalFormSchema>

function onSubmit(data: GeneralFormValues) {
    toast({
        title: "You submitted the following values:",
        description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
        ),
    })
}

const defaultValues: Partial<GeneralFormValues> = {
    port: 9527
}

export default function GeneralForm() {
    const form = useForm<GeneralFormValues>({
        resolver: zodResolver(generalFormSchema),
        defaultValues
    })

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
                                <Input placeholder="9527" {...field} />
                            </FormControl>
                            <FormDescription>This is app connect port.</FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit">Update General</Button>
            </form>
        </Form>
    )
}

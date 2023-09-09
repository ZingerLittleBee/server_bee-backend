

import { useEffect, useMemo } from "react"
import { updateSecuritySettings } from "@/requests/settings"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { useLoadingBtn } from "@/hooks/useLoadingBtn"
import { useSettings } from "@/hooks/useSettings"
import { useToken } from "@/hooks/useToken"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

const securityFormSchema = z.object({
  token: z.string(),
})

type SecurityFormValues = z.infer<typeof securityFormSchema>

export function SecurityForm() {
  const { settings } = useSettings()
  const { LoadingBtn, setIsLoading: setIsBtnLoading } = useLoadingBtn()
  const { token } = useToken()

  const appConfig = useMemo(() => settings?.app, [settings])

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      token: appConfig?.token ?? "",
    },
  })

  useEffect(() => {
    if (form.formState.isDirty) return
    form.setValue("token", appConfig?.token ?? "")
  }, [form, appConfig])

  async function onSubmit(data: SecurityFormValues) {
    setIsBtnLoading(true)
    const res = await updateSecuritySettings(
      {
        token: data.token,
      },
      token.communicationToken
    )
    if (res) {
      toast({
        title: "Update Successfully",
      })
    } else {
      toast({
        title: "Update Error",
        description: "Please check console for more details.",
        variant: "destructive",
      })
    }
    setIsBtnLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication token</FormLabel>
              <FormControl>
                <Input placeholder="Your token" {...field} />
              </FormControl>
              <FormDescription>
                This is the token for communication with the app and web page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingBtn type="submit">Update Security</LoadingBtn>
      </form>
    </Form>
  )
}

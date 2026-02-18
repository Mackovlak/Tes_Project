import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { date, z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation, useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogTrigger } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"

import { FormDialog } from "../config/form-dialog"
import { TField } from "../config/tfield"
import { AsyncComboboxField } from "../config/async-combobox-field"
import ApiCustomer from "@/api"
import { SearchCommandBlock } from "@/components/sc-select"
import DatePicker from "@/components/date-picker"

const NMUSchema = z.object({
    NMUDesc: z.string(),
    ItemNeeded: z.boolean(),
    VersionNeeded: z.boolean(),
})

export function NMUEdit({ NMUId, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const nmuEditQuery = useQuery({
    queryKey: ["nmu", NMUId],
    enabled: open && !!NMUId,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/nmu/${NMUId}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        NMUDesc: values?.NMUDesc,
        ItemNeeded: Boolean(values?.ItemNeeded),
        VersionNeeded: Boolean(values?.VersionNeeded),
      }
      await ApiCustomer.patch(`/api/nmu/${NMUId}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        NMUDesc: "",
        ItemNeeded: false,
        VersionNeeded: false, 
    },
    onSubmit: async ({ value }) => {
      const parsed = NMUSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!nmuEditQuery.data) return
    const data = nmuEditQuery.data
    form.reset({
        NMUDesc: data?.NMUDesc,
        ItemNeeded: data?.ItemNeeded,
        VersionNeeded: data?.VersionNeeded,
    })
  }, [nmuEditQuery.data])


  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit NMU Information"
        description="Fields marked with * are required."
        submitting={updateMutation.isPending}
        submitLabel="Update"
        onSubmit={() => form.handleSubmit()}
        trigger={
          <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
          <Pencil className="w-4 h-4" />
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <form.Field name="NMUDesc" validators={{ required: "NMU Desc is required" }}>
            {(field) => (
              <TField label="NMU Desc" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

            {["ItemNeeded","VersionNeeded"].map((item) => (
            <form.Field name={item} key={item} >
                {(field) => (
                <TField label={item} field={field} span={2}>
                    {({ value, onChange, }) => (
                    <Input type={"checkbox"} checked={value} onChange={(e) => onChange(e.target.checked)} className={"h-4"}/>  
                    )}
                </TField>
                )}
            </form.Field>
            ))}
        </div>

        {/* Optional: show form-level loading state */}
        {nmuEditQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading nmu...</p> : null}
      </FormDialog>
    </>
  )
}

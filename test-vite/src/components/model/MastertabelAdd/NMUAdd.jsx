import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { date, z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation, useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Plus } from "lucide-react"

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

export function NMUAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        NMUDesc: values?.NMUDesc,
        ItemNeeded: Boolean(values?.ItemNeeded),
        VersionNeeded: Boolean(values?.VersionNeeded),
      }
      await ApiCustomer.post(`/api/nmu`, payload)
    },
    onSuccess: () => {
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

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Adding NMU Information"
        description="Fields marked with * are required."
        submitting={updateMutation.isPending}
        submitLabel="Submit"
        onSubmit={() => form.handleSubmit()}
        trigger={
          <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4"/>
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
      </FormDialog>
    </>
  )
}

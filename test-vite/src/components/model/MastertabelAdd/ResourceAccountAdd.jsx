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

const ResourceAccountSchema = z.object({
    ResourceAccountId: z.string(),
    Name: z.string(),
    Resource: z.object({
        ResourceId: z.string(),
        name: z.string().optional(),
    }), 
})

export function ResourceAccountAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ResourceAccountId: values?.ResourceAccountId,
        Name: values?.Name,
        ResourceId: values?.Resource?.ResourceId ?? null,
      }
      await ApiCustomer.post(`/api/resource-account`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        ResourceAccountId: "",
        Name: "",
        Resource: null,
       
    },
    onSubmit: async ({ value }) => {
      const parsed = ResourceAccountSchema.safeParse(value)
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
        title="Adding Resource Account Information"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field name="ResourceAccountId" validators={{ required: "Resource Account Id is required" }}>
            {(field) => (
            <TField label="Resource Account Id" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

          <form.Field name="Name" validators={{ required: "Name is required" }}>
            {(field) => (
            <TField label="Name" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
            </TField>
            )}
        </form.Field>

        <form.Field name="Resource">
            {(field) => (
            <TField label="Resource"  field={field}>
                {({ value, onChange, onBlur }) => (
                    <AsyncComboboxField
                        value={value}
                        onChange={onChange}
                        labelKey={"Name"}
                        valueKey={"ResourceId"}
                        placeholder="Search resource..."
                        fetcher={async (q) => {
                        const res = await ApiCustomer.get(`/api/resources`, {params: {q}})
                        const data = res.data.data
                        return data.map((item) => ({
                            ResourceId: item.ResourceId,
                            Name: item.Name,
                        }))
                        }}
                    />
                )}
            </TField>
            )}
        </form.Field>

        </div>
      </FormDialog>
    </>
  )
}

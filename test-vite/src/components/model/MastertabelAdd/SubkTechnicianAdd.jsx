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

const SubkTechnicianSchema = z.object({
    SubkTechnicianId: z.string(),
    Name: z.string(),
    ResourceAccount: z.object({
        ResourceAccountId: z.string(),
        name: z.string().optional(),
    }).nullable(),
})

export function SubkTechnicianAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        SubkTechnicianId: values?.SubkTechnicianId,
        Name: values?.Name,
        ResourceAccountId: values?.ResourceAccount?.ResourceAccountId ?? null,
      }
      await ApiCustomer.post(`/api/subk-technician`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        SubkTechnicianId: "",
        Name: "",
        Resource: null,
       
    },
    onSubmit: async ({ value }) => {
      const parsed = SubkTechnicianSchema.safeParse(value)
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
        title="Adding Subk Technician Information"
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
            <form.Field name="SubkTechnicianId" validators={{ required: "Subk Technician Id is required" }}>
            {(field) => (
              <TField label="Subk Technician Id" required field={field}>
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

          <form.Field name="ResourceAccount">
            {(field) => (
              <TField label="Resource Account"  field={field}>
                {({ value, onChange }) => (
                    <AsyncComboboxField
                        value={value}
                        onChange={onChange}
                        labelKey={"name"}
                        valueKey={"ResourceAccountId"}
                        placeholder="Search resource..."
                        fetcher={async (q) => {
                          const res = await ApiCustomer.get("/api/resource-account", { params: { q } })
                          const data = res.data.data ?? []
                          console.log("Fetched resource accounts:", data)
                            return data.map((item) => ({
                                name: item.Name,
                                ResourceAccountId: item.ResourceAccountId,
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

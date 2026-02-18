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

const OTCCodeSchema = z.object({
    OTCCode: z.string(),
    Description: z.string(),
    WarrantyCondition: z.string(),
})

export function OTCCodeAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        OTCCode: values?.OTCCode,
        Description: values?.Description,
        WarrantyCondition: values?.WarrantyCondition,
      }
      await ApiCustomer.post(`/api/otc-code`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        OTCCode: "",
        Description: "",
        WarrantyCondition: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = OTCCodeSchema.safeParse(value)
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
        title="Adding OTC Code Information"
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
       <form.Field name="OTCCode" validators={{ required: "OTC Code is required" }}>
            {(field) => (
                <TField label="OTC Code" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
                </TField>
            )}
            </form.Field>

            <form.Field name="Description" validators={{ required: "Description is required" }}>
            {(field) => (
                <TField label="Description" required field={field}>
                {({ value, onChange, onBlur }) => (
                        <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
                </TField>
            )}
            </form.Field>

            <form.Field name="WarrantyCondition" validators={{ required: "Warranty Condition is required" }}>
            {(field) => (
                <TField label="Warranty Condition" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <SearchCommandBlock
                        value={value}
                        onChange={onChange}
                        options={[
                            {label: "In Warranty", value: "InWarranty"},
                            {label: "Out Of Warranty", value: "OutWarranty"},
                        ]}
                    
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

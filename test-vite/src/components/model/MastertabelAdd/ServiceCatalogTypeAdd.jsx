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

const ServiceCatalogTypeSchema = z.object({
    ServiceTypeName: z.string(),
    ProblemCategory: z.string(),
})

export function ServiceCatalogTypeAdd() {
  const [open, setOpen] = React.useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ServiceTypeName: values?.ServiceTypeName,
        ProblemCategory: values?.ProblemCategory,
      }
      await ApiCustomer.post(`/api/service-type`, payload)
    },
    onSuccess: () => {
      setOpen(false)
    },
  })
  
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        ServiceTypeName: "",
        ProblemCategory: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = ServiceCatalogTypeSchema.safeParse(value)
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
        title="Adding Service Catalog Type Information"
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
        <form.Field name="ServiceTypeName" validators={{ required: "Service Type Name is required" }}>
            {(field) => (
                <TField label="Service Type Name" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
                </TField>
            )}
            </form.Field>

            <form.Field name="ProblemCategory" validators={{ required: "Problem Catagory is required" }}>
            {(field) => (
                <TField label="Problem Catagory" required field={field}>
                {({ value, onChange, onBlur }) => (
                    <SearchCommandBlock
                        onChange={onChange}
                        value={value}
                        options={[
                            "Hardware",
                            "Software"
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

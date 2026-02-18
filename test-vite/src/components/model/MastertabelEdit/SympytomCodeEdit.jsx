import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
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

const SymptomCodeSchema = z.object({
    SymptomCode: z.string().min(1, "Symptom Code is required"),
    TopCategory: z.string().min(1, "Top Category is required"),
    SubCategory: z.string().min(1, "Sub Category is required"),
    QualityCodes: z.string(),
})

export function SymptomCodeEdit({ SymptomCodeID, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const symptomCodeQuery = useQuery({
    queryKey: ["symptom-code", SymptomCodeID],
    enabled: open && !!SymptomCodeID,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/symptom-codes/${SymptomCodeID}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        SymptomCode: values?.SymptomCode || "",
        TopCategory: values?.TopCategory || "",
        SubCategory: values?.SubCategory || "",
        QualityCodes: values?.QualityCodes || "",
      }
      await ApiCustomer.patch(`/api/symptom-codes/${SymptomCodeID}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        SymptomCode: "",
        TopCategory: "",
        SubCategory: "",
        QualityCodes: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = SymptomCodeSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!symptomCodeQuery.data) return
    const data = symptomCodeQuery.data
    form.reset({
        SymptomCode: data?.SymptomCode ?? "",
        TopCategory: data?.TopCategory ?? "",
        SubCategory: data?.SubCategory ?? "",
        QualityCodes: data?.QualityCodes ?? "",
    })
  }, [symptomCodeQuery.data])

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Symptom Code Information"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="SymptomCode"
            validators={{ onChange: ({ value }) => (!value ? "Symptom Code is required" : undefined) }}
          >
            {(field) => (
              <TField label="Symptom Code" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="TopCategory"
            validators={{ onChange: ({ value }) => (!value ? "Top Category is required" : undefined) }}
          >
            {(field) => (
              <TField label="Top Category" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="SubCategory"
            validators={{ onChange: ({ value }) => (!value ? "Sub Category is required" : undefined) }}
          >
            {(field) => (
              <TField label="Sub Category" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="QualityCodes"
            validators={{ onChange: ({ value }) => (!value ? "Quality Codes is required" : undefined) }}
          >
            {(field) => (
              <TField label="Quality Codes" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {symptomCodeQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading symptom code...</p> : null}
      </FormDialog>
    </>
  )
}

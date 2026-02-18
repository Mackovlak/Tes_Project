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

const FailureSchema = z.object({
    Name: z.string(),
    Description: z.string()
})

export function FailureEdit({ FailureId, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const failurEditQuery = useQuery({
    queryKey: ["failure", FailureId],
    enabled: open && !!FailureId,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/failure/${FailureId}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        Name: values?.Name,
        Description: values?.Description
      }
      await ApiCustomer.patch(`/api/failure/${FailureId}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        Name: "",
        Description: ""
       
    },
    onSubmit: async ({ value }) => {
      const parsed = FailureSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!failurEditQuery.data) return
    const data = failurEditQuery.data
    form.reset({
        Name: data?.Name,
        Description: data?.Description
    })
  }, [failurEditQuery.data])


  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Failure Information"
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
          <form.Field name="Name" validators={{ required: "Name is required" }}>
            {(field) => (
              <TField label="Name" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Description" validators={{ required: "Description is required" }}>
            {(field) => (
              <TField label="Description" required field={field} span={2}>
                {({ value, onChange, onBlur }) => (
                  <Input  value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />  
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {failurEditQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading failure...</p> : null}
      </FormDialog>
    </>
  )
}

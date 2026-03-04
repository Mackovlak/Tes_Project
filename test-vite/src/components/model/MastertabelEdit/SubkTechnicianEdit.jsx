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

const SubkTechnicianSchema = z.object({
    SubkId: z.string(),
    Name: z.string(),
    ResourceAccount: z.object({
        ResourceAccountId: z.string(),
        name: z.string().optional(),
    }).nullable(),
})

export function SubkTechnicianEdit({ subkTechnicianId, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const subkTechnicianQuery = useQuery({
    queryKey: ["subkTechnician", subkTechnicianId],
    enabled: open && !!subkTechnicianId,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/subk-technician/${subkTechnicianId}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        SubkId: values?.SubkId,
        Name: values?.Name,
        ResourceAccountId: values?.ResourceAccount?.ResourceAccountId ?? null,
      }
      await ApiCustomer.patch(`/api/subk-technician/${subkTechnicianId}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })
  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        SubkId: "",
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

  React.useEffect(() => {
    if (!subkTechnicianQuery.data) return
    const data = subkTechnicianQuery.data
    form.reset({
        SubkId: data.SubkTechnicianId ?? "",
        Name: data.Name ?? "",
        ResourceAccount: data.ResourceAccountId ? { ResourceAccountId: data.ResourceAccountId, name: data.resourceAccount?.Name}  : null,
    })
  }, [subkTechnicianQuery.data])


  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Subk Technician Information"
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

          <form.Field name="SubkId" validators={{ required: "SubkId is required" }}>
            {(field) => (
              <TField label="SubkId" required field={field}>
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

        {/* Optional: show form-level loading state */}
        {subkTechnicianQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading subk technician...</p> : null}
      </FormDialog>
    </>
  )
}

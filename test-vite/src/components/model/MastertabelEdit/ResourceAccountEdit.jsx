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

const ResourceAccountSchema = z.object({
    Name: z.string(),
    Resource: z.object({
        ResourceId: z.string(),
        name: z.string().optional(),
    }),
})

export function ResourceAccountEdit({ resourceAccountID, resources, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const resourceAccountQuery = useQuery({
    queryKey: ["resourceAccount", resourceAccountID],
    enabled: open && !!resourceAccountID,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/resource-account/${resourceAccountID}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        Name: values.Name,
        ResourceId: values.Resource?.ResourceId ?? null,
      }
      await ApiCustomer.patch(`/api/resource-account/${resourceAccountID}`, payload)
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

  React.useEffect(() => {
    if (!resourceAccountQuery.data) return
    const data = resourceAccountQuery.data
    form.reset({
        Name: data.Name ?? "",
        Resource: data.ResourceId ? { ResourceId: data.ResourceId, Name: data.ResourceId } : null,
    })
  }, [resourceAccountQuery.data])


  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Resource Account Information"
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
                          const res = resources
                          return res.map((item) => ({
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

        {/* Optional: show form-level loading state */}
        {resourceAccountQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading resource account...</p> : null}
      </FormDialog>
    </>
  )
}

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation, useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Search } from "lucide-react"

import { FormDialog } from "../config/form-dialog"
import { TField } from "../config/tfield"
import { SearchCommandBlock } from "@/components/sc-select"
import ApiCustomer from "@/api"

const WarrantyServiceSchema = z.object({
    Service_description: z.string().min(1, "Service Description is required"),
    CTat_RTime: z.string().min(1, "CTat RTime is required"),
    Price: z.number().optional(),
    Shipping_Fee: z.number().optional(),
    qty_ws: z.number().optional(),
    Tax: z.number().optional(),
    Total: z.number().optional(),
    WarrantyCondition: z.string().nullable().optional(),
    CaseTypeServices: z.string().nullable().optional(),
})

export function WarrantyServiceEdit({ Service_offerID, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const warrantyServiceQuery = useQuery({
    queryKey: ["warrantyService", Service_offerID],
    enabled: open && !!Service_offerID,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/warranty-services/${Service_offerID}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        Service_description: values?.Service_description || "",
        CTat_RTime: values?.CTat_RTime || "",
        Price: values?.Price ? parseFloat(values.Price) : 0,
        Shipping_Fee: values?.Shipping_Fee ? parseFloat(values.Shipping_Fee) : 0,
        qty_ws: values?.qty_ws ? parseInt(values.qty_ws) : 0,
        Tax: values?.Tax ? parseFloat(values.Tax) : 0,
        Total: values?.Total ? parseFloat(values.Total) : 0,
        WarrantyCondition: values?.WarrantyCondition || null,
        CaseTypeServices: values?.CaseTypeServices || null,
      }
      await ApiCustomer.patch(`/api/warranty-services/${Service_offerID}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        Service_description: "",
        CTat_RTime: "",
        Price: 0,
        Shipping_Fee: 0,
        qty_ws: 0,
        Tax: 0,
        Total: 0,
        WarrantyCondition: null,
        CaseTypeServices: null,
    },
    onSubmit: async ({ value }) => {
      const parsed = WarrantyServiceSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!warrantyServiceQuery.data) return
    const data = warrantyServiceQuery.data
    form.reset({
        Service_description: data?.Service_description ?? "",
        CTat_RTime: data?.CTat_RTime ?? "",
        Price: data?.Price ?? 0,
        Shipping_Fee: data?.Shipping_Fee ?? 0,
        qty_ws: data?.qty_ws ?? 0,
        Tax: data?.Tax ?? 0,
        Total: data?.Total ?? 0,
        WarrantyCondition: data?.WarrantyCondition ?? null,
        CaseTypeServices: data?.CaseTypeServices ?? null,
    })
  }, [warrantyServiceQuery.data])

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Warranty Service Information"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <form.Field
            name="Service_description"
            validators={{ onChange: ({ value }) => (!value ? "Service Description is required" : undefined) }}
          >
            {(field) => (
              <TField label="Service Description" required field={field} span={3}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="CTat_RTime"
            validators={{ onChange: ({ value }) => (!value ? "CTat RTime is required" : undefined) }}
          >
            {(field) => (
              <TField label="CTat RTime" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Price"
          >
            {(field) => (
              <TField label="Price"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Shipping_Fee"
          >
            {(field) => (
              <TField label="Shipping Fee"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="qty_ws"
          >
            {(field) => (
              <TField label="Quantity"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Tax"
          >
            {(field) => (
              <TField label="Tax"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Total"
          >
            {(field) => (
              <TField label="Total"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="WarrantyCondition"
          >
            {(field) => (
              <TField label="Warranty Condition"  field={field} span={3}>
                {({ value, onChange }) => (
                    <SearchCommandBlock
                        onChange={onChange}
                        value={value}
                        placeholder="Search Warranty Condition"
                        options={[
                            { label: "In Warranty", value: "InWarranty" },
                            { label: "Out of Warranty", value: "OutWarranty" },
                        ]}
                    
                    />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="caseTypeServices"
          >
            {(field) => (
              <TField label="Case Type Services"  field={field} span={3}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

        </div>

        {/* Optional: show form-level loading state */}
        {warrantyServiceQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading warranty service...</p> : null}
      </FormDialog>
    </>
  )
}

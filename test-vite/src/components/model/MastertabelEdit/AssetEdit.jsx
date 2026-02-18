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

const AssetSchema = z.object({
  SerialNumber: z.string().min(1, "Serial Number is required"),
  Product: z.any().refine(Boolean, "Product is required"),
  SiteAccount: z.any().nullable(),
  Contact: z.any().nullable(),
  Warranty: z.any().nullable(),
  EOW_Date: z.string().nullable(),
})

export function AssetEdit({ assetId, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const assetQuery = useQuery({
    queryKey: ["asset", assetId],
    enabled: open && !!assetId,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/asset-information/${assetId}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        SerialNumber: values.SerialNumber,
        ProductNumber: values.Product?.ProductNumber ?? null,
        SiteAccountID: values.SiteAccount?.SiteAccountID ?? null,
        ContactID: values.Contact?.ContactID ?? null,
        Warranty_Status: values.Warranty?.OTCCode ?? null,
        EOW_Date: values.EOW_Date || null,
      }
      await ApiCustomer.patch(`/api/asset-information/${assetId}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
      SerialNumber: "",
      Product: null,
      SiteAccount: null,
      Contact: null,
      Warranty: null,
      EOW_Date: null,
    },
    onSubmit: async ({ value }) => {
      const parsed = AssetSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!assetQuery.data) return
    const data = assetQuery.data
    form.reset({
      SerialNumber: data?.SerialNumber ?? "",
      Product: data?.product_information ?? null,
      SiteAccount: data?.site_account ?? null,
      Contact: data?.contact_information ?? null,
      Warranty: data?.WarrantyOTCCode ?? null,
      EOW_Date: data?.EOW_Date ? data.EOW_Date.split("T")[0] : null,
    })
  }, [assetQuery.data])

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Asset Information"
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
            name="SerialNumber"
            validators={{ onChange: ({ value }) => (!value ? "Serial Number is required" : undefined) }}
          >
            {(field) => (
              <TField label="Serial Number" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Product"
            validators={{ onChange: ({ value }) => (!value ? "Product is required" : undefined) }}
          >
            {(field) => (
              <TField label="Product" required field={field}>
                {({ value, onChange }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey="ProductName"
                    valueKey="ProductNumber"
                    placeholder="Search product..."
                    fetcher={async (q) => {
                      const res = await ApiCustomer.get("/api/product-information", { params: { q } })
                      return res.data.data ?? []
                    }}
                  />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="SiteAccount">
            {(field) => (
              <TField label="Site Account" field={field}>
                {({ value, onChange }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey="Company"
                    valueKey="SiteAccountID"
                    placeholder="Search site account..."
                    fetcher={async (q) => {
                      const res = await ApiCustomer.get("/api/site_account", { params: { q } })
                      return res.data.data ?? []
                    }}
                  />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Contact">
            {(field) => (
              <TField label="Contact" field={field}>
                {({ value, onChange }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey="FirstName"
                    valueKey="ContactID"
                    placeholder="Search contact..."
                    fetcher={async (q) => {
                      const res = await ApiCustomer.get("/api/contact-information", { params: { q } })
                      return res.data.data ?? []
                    }}
                  />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="Warranty">
            {(field) => (
              <TField label="Warranty Status" field={field}>
                {({ value, onChange }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey="Description"
                    valueKey="OTCCode"
                    placeholder="Select warranty status..."
                    fetcher={async (q) => {
                      const res = await ApiCustomer.get("/api/otc-code", { params: { q } })
                      return res.data.data ?? []
                    }}
                  />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field name="EOW_Date">
            {(field) => (
              <TField label="End of Warranty Date" field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input
                    type="date"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value || null)}
                    onBlur={onBlur}
                  />
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {assetQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading asset...</p> : null}
      </FormDialog>
    </>
  )
}

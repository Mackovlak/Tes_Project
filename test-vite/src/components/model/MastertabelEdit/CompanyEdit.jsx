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

const CompanySchema = z.object({
  Company: z.string().min(1, "Company is required"),
  Email: z.string().email("Email is required"),
  PrimaryPhone: z.string().min(1, "Primary Phone is required"),
  WhatsappNo: z.string(),
  AddressLine1: z.string().min(1, "Address Line 1 is required"),
  AddressLine2: z.string(),
  City: z.object({ City: z.string(), }).nullable(),
  Province: z.object({ StateProvince: z.string(),}).nullable(),
  Country: z.string().min(1, "Country is required"),
  ZipPostalCode: z.string().min(1, "Zip/Postal Code is required"),
  NPWP: z.string(),
})

export function CompanyEdit({ siteAccountId, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const companyQuery = useQuery({
    queryKey: ["company", siteAccountId],
    enabled: open && !!siteAccountId,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/site_account/${siteAccountId}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        Company: values?.Company || "",
        Email: values?.Email || "",
        PrimaryPhone: values?.PrimaryPhone || "",
        WhatsappNo: values?.WhatsappNo || "",
        AddressLine1: values?.AddressLine1 || "",
        AddressLine2: values?.AddressLine2 || "",
        City: values?.City?.City || "",
        StateProvince: values?.Province?.StateProvince || "",
        Country: values?.Country || "",
        ZipPostalCode: values?.ZipPostalCode || "",
        NPWP: values?.NPWP || "",
      }
      await ApiCustomer.patch(`/api/site_account/${siteAccountId}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        Company: "",
        Email: "",
        PrimaryPhone: "",
        WhatsappNo: "",
        AddressLine1: "",
        AddressLine2: "",
        City: null,
        Province: null,
        Country: "",
        ZipPostalCode: "",
        NPWP: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = CompanySchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!companyQuery.data) return
    const data = companyQuery.data
    form.reset({
      Company: data?.Company ?? "",
      Email: data?.Email ?? "",
      PrimaryPhone: data?.PrimaryPhone ?? "",
      WhatsappNo: data?.WhatsappNo ?? "",
      AddressLine1: data?.AddressLine1 ?? "",
      AddressLine2: data?.AddressLine2 ?? "",
      City: data?.City ? { City: data.City } : null,
      Province: data?.StateProvince ? { StateProvince: data.StateProvince } : null,
      Country: data?.Country ?? "",
      ZipPostalCode: data?.ZipPostalCode ?? "",
      NPWP: data?.NPWP ?? "",
    })
  }, [companyQuery.data])

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Company Information"
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
            name="Company"
            validators={{ onChange: ({ value }) => (!value ? "Company is required" : undefined) }}
          >
            {(field) => (
              <TField label="Company" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
          
          <form.Field
            name="Email"
            validators={{ onChange: ({ value }) => (!value ? "Email is required" : undefined) }}
          >
            {(field) => (
              <TField label="Email" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="PrimaryPhone"
            validators={{ onChange: ({ value }) => (!value ? "Primary Phone is required" : undefined) }}
          >
            {(field) => (
              <TField label="Primary Phone" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
          
          <form.Field
            name="WhatsappNo"
            validators={{ onChange: ({ value }) => (!value ? "Whatsapp No is required" : undefined) }}
          >
            {(field) => (
              <TField label="Whatsapp No" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="AddressLine1"
            validators={{ onChange: ({ value }) => (!value ? "Address Line 1 is required" : undefined) }}
          >
            {(field) => (
              <TField label="Address Line 1" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="AddressLine2"
          >
            {(field) => (
              <TField label="Address Line 2" field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="City"
            validators={{ onChange: ({ value }) => (!value ? "City is required" : undefined) }}
          >
            {(field) => (
              <TField label="City" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey="City"
                    valueKey="City"
                    placeholder="Search city..."
                    fetcher={async (q) => {
                      const province = form.getFieldValue("Province");
                      if (!province || !province.id) return [];
                      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${province.id}.json`).then((res) => res.json());
                      return res.map((item) => ({
                        id: item.id,
                        City: item.name,
                      }))
                    }}
                  />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Province"
            validators={{ onChange: ({ value }) => (!value ? "State/Province is required" : undefined) }}
          >
            {(field) => (
              <TField label="State/Province" required field={field}>
                {({ value, onChange }) => (
                  <AsyncComboboxField
                    value={value}
                    onChange={onChange}
                    labelKey="StateProvince"
                    valueKey="StateProvince"
                    placeholder="Search state/province..."
                    fetcher={async (q) => {
                      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json`).then((res) => res.json())
                      return res.map((item) => ({
                        id: item.id,
                        StateProvince: item.name,
                      }))
                    }}
                  />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Country"
            validators={{ onChange: ({ value }) => (!value ? "Country is required" : undefined) }}
          >
            {(field) => (
              <TField label="Country" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ZipPostalCode"
            validators={{ onChange: ({ value }) => (!value ? "Zip/Postal Code is required" : undefined) }}
          >
            {(field) => (
              <TField label="Zip/Postal Code" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="NPWP"
          >
            {(field) => (
              <TField label="NPWP" field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {companyQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading company...</p> : null}
      </FormDialog>
    </>
  )
}

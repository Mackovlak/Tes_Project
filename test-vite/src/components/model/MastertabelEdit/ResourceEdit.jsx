import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { number, z } from "zod"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useMutation, useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Search } from "lucide-react"

import { FormDialog } from "../config/form-dialog"
import { TField } from "../config/tfield"
import ApiCustomer from "@/api"
import { AsyncComboboxField } from "../config/async-combobox-field"

const ResourceSchema = z.object({
    ResourceId: z.string().min(1, "Resource ID is required"),
    Name: z.string().min(1, "Name is required"),
    ServiceCenterName: z.string(),
    ResourceCode: z.number().optional(),
    ResourceLogo: z.string().optional(),
    Phone: z.string(),
    Mobile: z.string(),
    Fax: z.string(),
    Email: z.string(),
    City: z.object({
        City: z.string(),
    }),
    Province: z.object({
        StateProvince: z.string(),
    }),
    Country: z.string(),
    ZipPostalCode: z.string(),
    AddressLine: z.string(),
})

function fileToString(file) {
  if (!file) return null
  if (file instanceof File) return file.name
  return file
}

export function ResourceEdit({ ResourceId, onUpdate }) {
  const [open, setOpen] = React.useState(false)

  const resourceQuery = useQuery({
    queryKey: ["resource", ResourceId],
    enabled: open && !!ResourceId,
    queryFn: async () => {
      const res = await ApiCustomer.get(`/api/resources/${ResourceId}`)
      return res.data.data
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ResourceId: values?.ResourceId,
        Name: values?.Name,
        ServiceCenterName: values?.ServiceCenterName,
        ResourceCode: Number(values?.ResourceCode),
        ResourceLogo: fileToString(values?.ResourceLogo),
        Phone: values?.Phone,
        Mobile: values?.Mobile,
        Fax: values?.Fax,
        Email: values?.Email,
        City: values?.City?.City,
        StateProvince: values?.Province?.StateProvince,
        Country: values?.Country,
        ZipPostalCode: values?.ZipPostalCode,
        AddressLine: values?.AddressLine,
      }
      await ApiCustomer.patch(`/api/resources/${ResourceId}`, payload)
    },
    onSuccess: () => {
      onUpdate?.()
      setOpen(false)
    },
  })

  const form = useForm({
    validatorAdapter: zodValidator,
    defaultValues: {
        ResourceId: "",
        Name: "",
        ServiceCenterName: "",
        ResourceCode: null,
        ResourceLogo: "",
        Phone: "",
        Mobile: "",
        Fax: "",
        Email: "",
        City: null,
        Province: null,
        Country: "",
        ZipPostalCode: "",
        AddressLine: "",
    },
    onSubmit: async ({ value }) => {
      const parsed = ResourceSchema.safeParse(value)
      if (!parsed.success) {
        return
      }
      await updateMutation.mutateAsync(parsed.data)
    },
  })

  React.useEffect(() => {
    if (!resourceQuery.data) return
    const data = resourceQuery.data
    form.reset({
        ResourceId: data?.ResourceId ?? "",
        Name: data?.Name ?? "",
        ServiceCenterName: data?.ServiceCenterName ?? "",
        ResourceCode: data?.ResourceCode ?? "",
        ResourceLogo: data?.ResourceLogo ?? "",
        Phone: data?.Phone ?? "",
        Mobile: data?.Mobile ?? "",
        Fax: data?.Fax ?? "",
        Email: data?.Email ?? "",
        City: data?.City ? { City: data?.City } : null,
        Province: data?.StateProvince ? { StateProvince: data?.StateProvince } : null,
        Country: data?.Country ?? "",
        ZipPostalCode: data?.ZipPostalCode ?? "",
        AddressLine: data?.AddressLine ?? "",
    })
  }, [resourceQuery.data])

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Resource Information"
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
            name="ResourceId"
            validators={{ onChange: ({ value }) => (!value ? "Resource ID is required" : undefined) }}
          >
            {(field) => (
              <TField label="Resource ID" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Name"
            validators={{ onChange: ({ value }) => (!value ? "Name is required" : undefined) }}
          >
            {(field) => (
              <TField label="Name" required field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ServiceCenterName"
          >
            {(field) => (
              <TField label="Service Center Name"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ResourceCode"
          >
            {(field) => (
              <TField label="Resource Code" field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ResourceLogo"
          >
            {(field) => (
              <TField label="Resource Logo"  field={field}>
                {({onChange, onBlur }) => (
                  <Input type={"file"} accept="image/*"  onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      const reader = new FileReader()
                      reader.onload = () => {
                        onChange(reader.result)
                      }
                      reader.readAsDataURL(file)
                    }} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Phone"
          >
            {(field) => (
              <TField label="Phone"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Mobile"
          >
            {(field) => (
              <TField label="Mobile"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Fax"
          >
            {(field) => (
              <TField label="Fax"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="Email"
          >
            {(field) => (
              <TField label="Email"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

            <form.Field
            name="Province"
          >
            {(field) => (
              <TField label="State/Province"  field={field}>
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
            name="City"
          >
            {(field) => (
              <TField label="City"  field={field}>
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
            name="Country"
          >
            {(field) => (
              <TField label="Country"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="ZipPostalCode"
          >
            {(field) => (
              <TField label="Zip/Postal Code"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>

          <form.Field
            name="AddressLine"
          >
            {(field) => (
              <TField label="Address Line"  field={field}>
                {({ value, onChange, onBlur }) => (
                  <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
                )}
              </TField>
            )}
          </form.Field>
        </div>

        {/* Optional: show form-level loading state */}
        {resourceQuery.isFetching ? <p className="text-sm text-muted-foreground mt-2">Loading resource data...</p> : null}
      </FormDialog>
    </>
  )
}
